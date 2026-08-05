/**
 * Funcions de servidor (RPC) per gestionar els pòdcasts a Railway Postgres.
 * Aquest fitxer ha de ser només un embolcall prim: la lògica viu a podcasts.server.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { NewPodcast, PodcastRow } from "./podcasts.server";

export type { PodcastRow };

export interface PublishPodcastInput extends Omit<NewPodcast, "origin"> {}

export const insertPodcast = createServerFn({ method: "POST" })
  .inputValidator((input: PublishPodcastInput) => input)
  .handler(async ({ data }) => {
    const { getSql, createPodcast } = await import("./podcasts.server");
    const origin = new URL(getRequest().url).origin;
    const sql = getSql();
    try {
      return await createPodcast(sql, { ...data, origin });
    } finally {
      await sql.end();
    }
  });

export const fetchApprovedPodcasts = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql, listApproved } = await import("./podcasts.server");
  const sql = getSql();
  try {
    return await listApproved(sql);
  } finally {
    await sql.end();
  }
});

export const fetchAllPodcasts = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql, listAll } = await import("./podcasts.server");
  const sql = getSql();
  try {
    return await listAll(sql);
  } finally {
    await sql.end();
  }
});

export interface ReviewInput {
  id: number;
  status: "pendent" | "aprovat" | "rebutjat";
  teacherNote: string | null;
  publishAt: string | null;
}

export const reviewPodcastFn = createServerFn({ method: "POST" })
  .inputValidator((input: ReviewInput) => input)
  .handler(async ({ data }) => {
    const { getSql, reviewPodcast } = await import("./podcasts.server");
    const sql = getSql();
    try {
      return await reviewPodcast(sql, data.id, data.status, data.teacherNote, data.publishAt);
    } finally {
      await sql.end();
    }
  });
