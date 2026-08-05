/**
 * Publicació d'un pòdcast: tot (fitxa, àudio i caràtula) va a Railway Postgres.
 * No fem servir cap emmagatzematge extern.
 */
import { insertPodcast } from "./podcasts.functions";

export interface PublishInput {
  blob: Blob;
  title: string;
  desc: string;
  cat: string;
  author: string;
  tags: string[];
  transcript: string;
  dur: number;
  template: string | null;
  cover: string | null;
  coverFile: File | null;
  publishAt: string | null;
}

export async function blobToBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export async function publishPodcast(input: PublishInput) {
  const audioBase64 = await blobToBase64(input.blob);
  const coverBase64 = input.coverFile ? await blobToBase64(input.coverFile) : null;

  return insertPodcast({
    data: {
      title: input.title,
      desc: input.desc || null,
      cat: input.cat || null,
      author: input.author || null,
      tags: input.tags,
      transcript: input.transcript || null,
      dur: Math.round(input.dur),
      template: input.template,
      cover: input.cover,
      audioBase64,
      audioMime: input.blob.type || "audio/webm",
      coverBase64,
      coverMime: input.coverFile?.type ?? null,
      publishAt: input.publishAt,
    },
  });
}
