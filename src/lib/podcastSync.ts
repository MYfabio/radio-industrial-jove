/**
 * Avís entre pestanyes: quan el mestre aprova o rebutja un pòdcast,
 * el mur (obert en una altra pestanya o pantalla) es refresca tot sol.
 */
const CHANNEL = "radio-escolar-podcasts";

export function notifyPodcastsChanged() {
  if (typeof window === "undefined") return;
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ t: Date.now() });
    bc.close();
  } catch {
    /* navegador sense BroadcastChannel */
  }
  try {
    localStorage.setItem("podcasts-updated-at", String(Date.now()));
  } catch {
    /* emmagatzematge no disponible */
  }
}

export function onPodcastsChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = () => cb();
  } catch {
    bc = null;
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === "podcasts-updated-at") cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    bc?.close();
    window.removeEventListener("storage", onStorage);
  };
}
