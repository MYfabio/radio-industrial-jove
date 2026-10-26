/**
 * Motor d'àudio de l'estudi (Web Audio). Dos busos separats:
 *
 *   MICRO n ──► [selecció d'entrada] ──► MONO ──► VOLUM ──► PANORAMA ─┬──► BUS D'EMISSIÓ ──► analitzador
 *                                                                    │        (programa)   └─► gravació (MediaRecorder)
 *                                                                    └──► retorn micros ──┐
 *   EFECTES / FONS ──► fxIn ─┬──► BUS D'EMISSIÓ                                          ├─► BUS D'AURICULARS (mestre)
 *                            └──► retorn fons ─────────────────────────────────────────┘        │
 *                                                                                  sortides ◄─────┘
 *
 * - El bus d'emissió és l'únic que va a la gravació; el d'auriculars només va
 *   a les sortides. Cap dels dos s'alimenta de l'altre: no hi ha bucles ni
 *   veu duplicada a la gravació.
 * - Els controls del bus d'auriculars (mestre, micros, fons) no toquen el que
 *   es grava. El volum i el panorama de cada micro són de la tira del micro:
 *   afecten tots dos busos, igual que en una taula de mescles real (el retorn
 *   és "post-fader": sents el balanç que s'està gravant).
 * - Mescla menys u (N-1): cada sortida d'auriculars té el seu propi bus de
 *   retorn. Si un casc està aparellat amb un micro (el mateix dispositiu USB,
 *   o triat a mà), aquell casc no rep el seu propi micro: la persona se sent
 *   de manera natural i no amb la còpia retardada que el navegador retorna
 *   (que es percep com a eco). Opció «sentir-me a mi mateix» per tornar-la a rebre.
 * - Sortides: la primera fa servir AudioContext.setSinkId (latència mínima i
 *   tria de parell de canals en interfícies de més de 2). Les addicionals (o
 *   totes, si el navegador no té setSinkId al context) van per
 *   MediaStreamDestination + <audio>.setSinkId. Si cap de les dues existeix,
 *   tot surt per la sortida per defecte del sistema.
 */

export type InputChannel = "mix" | "left" | "right";

export interface MicConfig {
  /** Identificador de la tira (estable mentre dura la sessió). */
  id: string;
  /** deviceId del micro ("" = el per defecte del sistema). */
  deviceId: string;
  label: string;
  inputChannel: InputChannel;
  /** 0..2 (1 = sense canvi). */
  volume: number;
  /** -1 (esquerra) .. 1 (dreta); 0 = centrat. */
  pan: number;
}

export interface MonitorLevels {
  /** Activa o desactiva la veu dels micros als auriculars. */
  micsEnabled: boolean;
  master: number;
  mics: number;
  fx: number;
}

export type OutputMode = "context" | "element" | "default";

export interface OutputSupport {
  /** AudioContext.setSinkId (Chrome/Edge 110+). */
  contextSink: boolean;
  /** HTMLMediaElement.setSinkId (Chrome/Edge, Firefox 116+). */
  elementSink: boolean;
  mode: OutputMode;
}

export function detectOutputSupport(): OutputSupport {
  if (typeof window === "undefined")
    return { contextSink: false, elementSink: false, mode: "default" };
  const contextSink =
    typeof AudioContext !== "undefined" &&
    "setSinkId" in AudioContext.prototype;
  const elementSink =
    typeof HTMLMediaElement !== "undefined" &&
    "setSinkId" in HTMLMediaElement.prototype;
  return {
    contextSink,
    elementSink,
    mode: contextSink ? "context" : elementSink ? "element" : "default",
  };
}

type SinkCapable = { setSinkId: (id: string) => Promise<void> };

interface Strip {
  config: MicConfig;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  splitter: ChannelSplitterNode;
  selL: GainNode;
  selR: GainNode;
  mono: GainNode;
  volume: GainNode;
  panner: StereoPannerNode;
  sourceChannels: number;
  connected: boolean;
}

interface ElementOutput {
  deviceId: string;
  dest: MediaStreamAudioDestinationNode;
  el: HTMLAudioElement;
  bus: OutBus;
}

/** Bus de retorn d'una sortida concreta: el seu mestre i un guany per micro. */
interface OutBus {
  master: GainNode;
  stripGains: Map<string, GainNode>;
}

/** Clau d'aparellament de la sortida per defecte del sistema. */
export const DEFAULT_OUTPUT_KEY = "";

export interface MicConstraintsOptions {
  /** Processament de "videotrucada" (cancel·lació d'eco, soroll, guany automàtic). Per defecte desactivat. */
  processing: boolean;
}

export function micConstraints(
  deviceId: string,
  opts: MicConstraintsOptions,
): MediaTrackConstraints {
  const base: MediaTrackConstraints = {
    echoCancellation: opts.processing,
    noiseSuppression: opts.processing,
    autoGainControl: opts.processing,
  };
  return deviceId ? { ...base, deviceId: { exact: deviceId } } : base;
}

export class StudioEngine {
  readonly ctx: AudioContext;
  /** Bus d'emissió/gravació. */
  readonly program: GainNode;
  readonly analyser: AnalyserNode;
  readonly recordDest: MediaStreamAudioDestinationNode;
  /** Entrada única per a efectes i música de fons (alimenta tots dos busos). */
  readonly fxIn: GainNode;
  /** Nivell del fons/efectes al retorn (comú a totes les sortides). */
  readonly monFx: GainNode;
  /** Bus de retorn de la sortida principal (la del context). */
  private primaryBus: OutBus;

  readonly support: OutputSupport;
  private strips = new Map<string, Strip>();
  private levels: MonitorLevels;
  private primaryDeviceId: string | null = null;
  private primaryPair = 0;
  private primaryRouting: AudioNode[] = [];
  private elementOutputs = new Map<string, ElementOutput>();
  private onStripChange: (() => void) | null = null;
  /** sortida (deviceId, o "" la per defecte) → id de la tira del seu micro. */
  private pairing = new Map<string, string>();
  private selfMonitor = false;

  constructor(levels: MonitorLevels) {
    this.ctx = new AudioContext({ latencyHint: "interactive" });
    this.support = detectOutputSupport();
    this.levels = { ...levels };

    this.program = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.recordDest = this.ctx.createMediaStreamDestination();
    this.program.connect(this.analyser);
    this.program.connect(this.recordDest);

    this.monFx = this.ctx.createGain();
    this.primaryBus = this.createBus();

    this.fxIn = this.ctx.createGain();
    this.fxIn.connect(this.program);
    this.fxIn.connect(this.monFx);

    this.applyLevels();
    // Fins que no es triï res, el retorn va a la sortida per defecte.
    this.routePrimary();
    void this.ctx.resume();
  }

  /** Avís quan un micro es desconnecta o es reconnecta (per refrescar la interfície). */
  setOnStripChange(cb: (() => void) | null) {
    this.onStripChange = cb;
  }

  get maxOutputChannels(): number {
    return this.ctx.destination.maxChannelCount || 2;
  }

  /** Mestre del retorn de la sortida principal (per a proves i mesures). */
  get monMaster(): GainNode {
    return this.primaryBus.master;
  }

  /** Retard aproximat del retorn per la sortida principal, en mil·lisegons. */
  latencyMs(): number {
    const base = this.ctx.baseLatency || 0;
    const out =
      (this.ctx as AudioContext & { outputLatency?: number }).outputLatency ||
      0;
    return Math.round((base + out) * 1000);
  }

  /* ------------------------- Busos de retorn ------------------------- */

  private createBus(): OutBus {
    const bus: OutBus = {
      master: this.ctx.createGain(),
      stripGains: new Map(),
    };
    this.monFx.connect(bus.master);
    this.strips.forEach((strip) => this.connectStripToBus(strip, bus));
    bus.master.gain.value = this.levels.master;
    return bus;
  }

  private destroyBus(bus: OutBus) {
    bus.stripGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {
        // Ja desconnectat.
      }
    });
    try {
      this.monFx.disconnect(bus.master);
    } catch {
      // Ja desconnectat.
    }
    try {
      bus.master.disconnect();
    } catch {
      // Ja desconnectat.
    }
  }

  private connectStripToBus(strip: Strip, bus: OutBus) {
    const g = this.ctx.createGain();
    g.gain.value = 0;
    strip.panner.connect(g);
    g.connect(bus.master);
    bus.stripGains.set(strip.config.id, g);
  }

  private allBuses(): { key: string; bus: OutBus }[] {
    const list = [
      { key: this.primaryDeviceId ?? DEFAULT_OUTPUT_KEY, bus: this.primaryBus },
    ];
    this.elementOutputs.forEach((o) =>
      list.push({ key: o.deviceId, bus: o.bus }),
    );
    return list;
  }

  /**
   * Quin micro és de cada casc (clau = deviceId de la sortida, "" = per defecte)
   * i si cadascú s'ha de sentir a si mateix.
   */
  setPairing(pairing: Record<string, string | null>, selfMonitor: boolean) {
    this.pairing = new Map(
      Object.entries(pairing).filter(
        (e): e is [string, string] => typeof e[1] === "string" && e[1] !== "",
      ),
    );
    this.selfMonitor = selfMonitor;
    this.applyLevels();
  }

  /* ----------------------------- Micròfons ----------------------------- */

  async addMic(config: MicConfig, opts: MicConstraintsOptions): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: micConstraints(config.deviceId, opts),
    });
    this.attachStream(config, stream);
  }

  private attachStream(config: MicConfig, stream: MediaStream) {
    const ctx = this.ctx;
    const old = this.strips.get(config.id);
    if (old) this.removeMic(config.id);

    const track = stream.getAudioTracks()[0];
    const sourceChannels = track?.getSettings().channelCount ?? 2;

    const source = ctx.createMediaStreamSource(stream);
    const splitter = ctx.createChannelSplitter(2);
    const selL = ctx.createGain();
    const selR = ctx.createGain();
    // Node mono: suma les dues entrades seleccionades en un sol canal.
    const mono = ctx.createGain();
    mono.channelCount = 1;
    mono.channelCountMode = "explicit";
    mono.channelInterpretation = "discrete";
    const volume = ctx.createGain();
    const panner = ctx.createStereoPanner();

    source.connect(splitter);
    splitter.connect(selL, 0);
    splitter.connect(selR, 1);
    selL.connect(mono);
    selR.connect(mono);
    mono.connect(volume).connect(panner);
    // Una sola connexió al bus d'emissió: la veu no es duplica mai a la gravació.
    panner.connect(this.program);

    const strip: Strip = {
      config: { ...config },
      stream,
      source,
      splitter,
      selL,
      selR,
      mono,
      volume,
      panner,
      sourceChannels,
      connected: true,
    };
    this.strips.set(config.id, strip);
    this.allBuses().forEach(({ bus }) => this.connectStripToBus(strip, bus));
    this.applyStrip(strip);
    this.applyLevels();

    track?.addEventListener("ended", () => {
      strip.connected = false;
      this.onStripChange?.();
    });
  }

  /** Torna a obrir el micro d'una tira (després d'una desconnexió). */
  async reopenMic(id: string, opts: MicConstraintsOptions): Promise<boolean> {
    const strip = this.strips.get(id);
    if (!strip) return false;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: micConstraints(strip.config.deviceId, opts),
    });
    this.attachStream(strip.config, stream);
    this.onStripChange?.();
    return true;
  }

  removeMic(id: string) {
    const strip = this.strips.get(id);
    if (!strip) return;
    this.disposeStrip(strip);
    this.strips.delete(id);
    this.allBuses().forEach(({ bus }) => {
      const g = bus.stripGains.get(id);
      if (!g) return;
      try {
        g.disconnect();
      } catch {
        // Ja desconnectat.
      }
      bus.stripGains.delete(id);
    });
  }

  private disposeStrip(strip: Strip) {
    strip.stream.getTracks().forEach((t) => t.stop());
    [
      strip.source,
      strip.splitter,
      strip.selL,
      strip.selR,
      strip.mono,
      strip.volume,
      strip.panner,
    ].forEach((n) => {
      try {
        n.disconnect();
      } catch {
        // Ja desconnectat.
      }
    });
  }

  updateMic(id: string, patch: Partial<Omit<MicConfig, "id" | "deviceId">>) {
    const strip = this.strips.get(id);
    if (!strip) return;
    strip.config = { ...strip.config, ...patch };
    this.applyStrip(strip);
  }

  private applyStrip(strip: Strip) {
    const t = this.ctx.currentTime;
    const { inputChannel, volume, pan } = strip.config;
    let l = 0;
    let r = 0;
    if (strip.sourceChannels < 2) {
      // Font realment mono: el canal 1 ja ho és tot.
      l = 1;
    } else if (inputChannel === "left") {
      l = 1;
    } else if (inputChannel === "right") {
      r = 1;
    } else {
      // Barreja L+R a la meitat: un micro "estèreo" que és mono duplicat queda igual de fort.
      l = 0.5;
      r = 0.5;
    }
    strip.selL.gain.setTargetAtTime(l, t, 0.01);
    strip.selR.gain.setTargetAtTime(r, t, 0.01);
    strip.volume.gain.setTargetAtTime(Math.max(0, volume), t, 0.02);
    strip.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), t, 0.02);
  }

  micStatus(): { id: string; connected: boolean; sourceChannels: number }[] {
    return [...this.strips.values()].map((s) => ({
      id: s.config.id,
      connected: s.connected,
      sourceChannels: s.sourceChannels,
    }));
  }

  hasMics(): boolean {
    return this.strips.size > 0;
  }

  /* --------------------------- Bus d'auriculars --------------------------- */

  setLevels(levels: MonitorLevels) {
    this.levels = { ...levels };
    this.applyLevels();
  }

  private applyLevels() {
    const t = this.ctx.currentTime;
    const micLevel = this.levels.micsEnabled ? this.levels.mics : 0;
    this.monFx.gain.setTargetAtTime(this.levels.fx, t, 0.02);
    this.allBuses().forEach(({ key, bus }) => {
      bus.master.gain.setTargetAtTime(this.levels.master, t, 0.02);
      const own = this.pairing.get(key);
      bus.stripGains.forEach((g, stripId) => {
        const isOwnMic = !this.selfMonitor && own === stripId;
        g.gain.setTargetAtTime(isOwnMic ? 0 : micLevel, t, 0.02);
      });
    });
  }

  /* ------------------------------- Sortides ------------------------------- */

  /**
   * Aplica la llista de sortides. La primera va pel context (si es pot); la
   * resta, per elements <audio>. Retorna els dispositius que no s'han pogut fer servir.
   */
  async setOutputs(deviceIds: string[], pair: number): Promise<string[]> {
    const failed: string[] = [];
    const wanted = [...new Set(deviceIds.filter(Boolean))];
    this.primaryPair = Math.max(0, pair);

    if (this.support.mode === "context") {
      const [first, ...rest] = wanted;
      const primary = first ?? "";
      if (primary !== (this.primaryDeviceId ?? "")) {
        try {
          await (this.ctx as unknown as SinkCapable).setSinkId(primary);
          this.primaryDeviceId = primary || null;
        } catch {
          if (primary) failed.push(primary);
          this.primaryDeviceId = null;
          await (this.ctx as unknown as SinkCapable)
            .setSinkId("")
            .catch(() => undefined);
        }
      }
      this.routePrimary();
      failed.push(...(await this.syncElementOutputs(rest)));
      this.applyLevels();
    } else if (this.support.mode === "element") {
      // Sense setSinkId al context: totes les sortides van per <audio>, i el
      // context no sona directament (si no, el so sortiria duplicat pel defecte).
      if (wanted.length === 0) {
        this.routePrimary();
        await this.syncElementOutputs([]);
      } else {
        this.unroutePrimary();
        failed.push(...(await this.syncElementOutputs(wanted)));
      }
    } else {
      this.routePrimary();
    }
    return failed;
  }

  /** Connecta el retorn a la sortida del context, al parell de canals triat. */
  private routePrimary() {
    this.unroutePrimary();
    const dest = this.ctx.destination;
    const max = this.maxOutputChannels;
    const pair = Math.min(
      this.primaryPair,
      Math.max(0, Math.floor(max / 2) - 1),
    );
    if (max <= 2 || pair === 0) {
      dest.channelCount = 2;
      dest.channelCountMode = "explicit";
      dest.channelInterpretation = "speakers";
      this.monMaster.connect(dest);
      this.primaryRouting = [];
      return;
    }
    // Interfície multicanal: L/R del retorn als canals (2·parell, 2·parell+1).
    dest.channelCount = max;
    dest.channelCountMode = "explicit";
    dest.channelInterpretation = "discrete";
    const split = this.ctx.createChannelSplitter(2);
    const merger = this.ctx.createChannelMerger(max);
    this.monMaster.connect(split);
    split.connect(merger, 0, pair * 2);
    split.connect(merger, 1, pair * 2 + 1);
    merger.connect(dest);
    this.primaryRouting = [split, merger];
  }

  private unroutePrimary() {
    try {
      this.monMaster.disconnect(this.ctx.destination);
    } catch {
      // No hi estava connectat.
    }
    this.primaryRouting.forEach((n) => {
      try {
        n.disconnect();
      } catch {
        // Ja desconnectat.
      }
    });
    if (this.primaryRouting.length > 0) {
      try {
        this.monMaster.disconnect(this.primaryRouting[0]!);
      } catch {
        // Ja desconnectat.
      }
    }
    this.primaryRouting = [];
  }

  private async syncElementOutputs(deviceIds: string[]): Promise<string[]> {
    const failed: string[] = [];
    for (const [id, out] of this.elementOutputs) {
      if (!deviceIds.includes(id)) this.removeElementOutput(out);
    }
    for (const id of deviceIds) {
      if (this.elementOutputs.has(id)) continue;
      // (el bus nou neix amb els micros a 0; applyLevels els posa al seu nivell)
      const bus = this.createBus();
      const dest = this.ctx.createMediaStreamDestination();
      bus.master.connect(dest);
      const el = new Audio();
      el.autoplay = true;
      el.srcObject = dest.stream;
      try {
        await (el as unknown as SinkCapable).setSinkId(id);
        await el.play();
        this.elementOutputs.set(id, { deviceId: id, dest, el, bus });
      } catch {
        this.destroyBus(bus);
        el.srcObject = null;
        failed.push(id);
      }
    }
    this.applyLevels();
    return failed;
  }

  private removeElementOutput(out: ElementOutput) {
    out.el.pause();
    out.el.srcObject = null;
    this.destroyBus(out.bus);
    this.elementOutputs.delete(out.deviceId);
  }

  activeOutputs(): string[] {
    const ids: string[] = [];
    if (this.primaryDeviceId) ids.push(this.primaryDeviceId);
    ids.push(...this.elementOutputs.keys());
    return ids;
  }

  /* ------------------------------- Final ------------------------------- */

  dispose() {
    this.strips.forEach((s) => this.disposeStrip(s));
    this.strips.clear();
    this.elementOutputs.forEach((o) => this.removeElementOutput(o));
    void this.ctx.close().catch(() => undefined);
  }
}
