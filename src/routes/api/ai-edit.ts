import { createFileRoute } from "@tanstack/react-router";

/**
 * Edición con IA: Gemini escucha directamente el audio (transcripción +
 * edición en una sola llamada) y genera título, resumen, capítulos y
 * consejos de montaje para el pódcast del alumno.
 */
export interface AiEditResult {
  transcript: string;
  titulo: string;
  resumen: string;
  capitulos: { tiempo: string; titulo: string }[];
  consejos: string[];
}

const PROMPT = `Ets un editor de pòdcast escolar. Escolta l'àudio adjunt (una gravació feta per un alumne) i respon NOMÉS amb un JSON amb aquest format exacte:
{"transcript": string, "titulo": string, "resumen": string, "capitulos": [{"tiempo": "mm:ss", "titulo": string}], "consejos": [string]}

- "transcript": transcripció completa i fidel del que se sent a l'àudio.
- "titulo": un títol curt i atractiu per al pòdcast.
- "resumen": 2 o 3 frases que resumeixin el contingut.
- "capitulos": marquen les parts del programa (màxim 5), amb el temps aproximat on comencen.
- "consejos": exactament 3 recomanacions senzilles i motivadores per millorar la pròxima gravació, en llenguatge clar per a alumnes.

Si no se sent cap veu a l'àudio, retorna transcript buit, titulo "Gravació sense veu detectada", un resumen explicant-ho, capitulos buit, i consejos amb suggeriments per gravar millor (parlar més a prop del micròfon, gravar en un lloc silenciós, fer una prova curta abans).

Escriu sempre en català.`;

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export const Route = createFileRoute("/api/ai-edit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["GEMINI_API_KEY"];
        if (!key) return new Response("Falta GEMINI_API_KEY", { status: 500 });
        const model = process.env["GEMINI_MODEL"] || "gemini-flash-latest";

        const form = await request.formData();
        const file = form.get("audio");
        if (!(file instanceof File)) {
          return new Response("Falta el audio", { status: 400 });
        }

        const audioBase64 = await fileToBase64(file);
        const mimeType = file.type || "audio/webm";

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: PROMPT },
                    { inline_data: { mime_type: mimeType, data: audioBase64 } },
                  ],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
            }),
          },
        );

        if (!geminiRes.ok) {
          const body = await geminiRes.text();
          console.error(`Edició IA amb Gemini ha fallat [${geminiRes.status}]: ${body}`);
          return new Response(body, { status: geminiRes.status });
        }

        const data = (await geminiRes.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

        let parsed: Partial<AiEditResult> = {};
        try {
          parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
        } catch {
          parsed = {};
        }

        return Response.json({
          transcript: parsed.transcript ?? "",
          titulo: parsed.titulo ?? "El meu pòdcast",
          resumen: parsed.resumen ?? "",
          capitulos: Array.isArray(parsed.capitulos) ? parsed.capitulos.slice(0, 5) : [],
          consejos: Array.isArray(parsed.consejos) ? parsed.consejos.slice(0, 3) : [],
        } satisfies AiEditResult);
      },
    },
  },
});
