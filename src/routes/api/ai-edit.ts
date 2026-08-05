import { createFileRoute } from "@tanstack/react-router";

/**
 * Edición con IA: transcribe la grabación y genera título, resumen,
 * capítulos y consejos de montaje para el pódcast del alumno.
 */
export interface AiEditResult {
  transcript: string;
  titulo: string;
  resumen: string;
  capitulos: { tiempo: string; titulo: string }[];
  consejos: string[];
}

const SYSTEM = `Eres un editor de pódcast escolar. Recibes la transcripción de una grabación hecha por alumnos.
Devuelve json con este formato exacto:
{"titulo": string, "resumen": string, "capitulos": [{"tiempo": "mm:ss", "titulo": string}], "consejos": [string]}
El título es corto y atractivo. El resumen tiene 2 o 3 frases. Los capítulos marcan las partes del programa (máximo 5).
Los consejos son 3 recomendaciones sencillas y motivadoras para mejorar la próxima grabación, en lenguaje claro para alumnos.
Escriu sempre en català.`;

export const Route = createFileRoute("/api/ai-edit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Falta LOVABLE_API_KEY", { status: 500 });

        const form = await request.formData();
        const file = form.get("audio");
        if (!(file instanceof File)) {
          return new Response("Falta el audio", { status: 400 });
        }

        // 1) Transcripción
        const sttForm = new FormData();
        sttForm.append("model", "openai/gpt-4o-mini-transcribe");
        sttForm.append("file", file, "podcast.wav");

        const sttRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
          body: sttForm,
        });

        if (!sttRes.ok) {
          const body = await sttRes.text();
          console.error(`Transcripción falló [${sttRes.status}]: ${body}`);
          return new Response(body, { status: sttRes.status });
        }

        const stt = (await sttRes.json()) as { text?: string };
        const transcript = (stt.text ?? "").trim();

        if (!transcript) {
          return Response.json({
            transcript: "",
            titulo: "Gravació sense veu detectada",
            resumen:
              "No hem sentit cap veu en aquesta gravació. Acosta't al micròfon i torna-ho a provar.",
            capitulos: [],
            consejos: [
              "Parla a uns 20 cm del micròfon.",
              "Grava en un lloc silenciós.",
              "Fes una prova curta abans del programa.",
            ],
          } satisfies AiEditResult);
        }

        // 2) Montaje asistido por IA
        const chatRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: `Transcripción del pódcast:\n\n${transcript}` },
            ],
          }),
        });

        if (!chatRes.ok) {
          const body = await chatRes.text();
          console.error(`Edición IA falló [${chatRes.status}]: ${body}`);
          return new Response(body, { status: chatRes.status });
        }

        const chat = (await chatRes.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const raw = chat.choices?.[0]?.message?.content ?? "{}";

        let parsed: Partial<AiEditResult> = {};
        try {
          parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
        } catch {
          parsed = {};
        }

        return Response.json({
          transcript,
          titulo: parsed.titulo ?? "El meu pòdcast",
          resumen: parsed.resumen ?? "",
          capitulos: Array.isArray(parsed.capitulos) ? parsed.capitulos.slice(0, 5) : [],
          consejos: Array.isArray(parsed.consejos) ? parsed.consejos.slice(0, 3) : [],
        } satisfies AiEditResult);
      },
    },
  },
});
