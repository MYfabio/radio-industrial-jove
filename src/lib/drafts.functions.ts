import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DraftMeta } from "./drafts.server";

/** Només els projectes de qui ha iniciat sessió. */
export const fetchDraftsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { listDrafts } = await import("./drafts.server");
    const sql = getSql();
    try {
      return await listDrafts(sql, context.userId);
    } finally {
      await sql.end();
    }
  });

export const saveDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: number | null; meta: DraftMeta }) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { saveDraft } = await import("./drafts.server");
    const sql = getSql();
    try {
      return { id: await saveDraft(sql, context.userId, data.id, data.meta) };
    } finally {
      await sql.end();
    }
  });

export const addDraftSegmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      draftId: number;
      position: number;
      mime: string;
      dataBase64: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { addDraftSegment } = await import("./drafts.server");
    const sql = getSql();
    try {
      return await addDraftSegment(sql, context.userId, data);
    } finally {
      await sql.end();
    }
  });

export const fetchDraftSegmentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { draftId: number; position: number }) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getDraftSegment } = await import("./drafts.server");
    const sql = getSql();
    try {
      return await getDraftSegment(
        sql,
        context.userId,
        data.draftId,
        data.position,
      );
    } finally {
      await sql.end();
    }
  });

export const deleteDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { deleteDraft } = await import("./drafts.server");
    const sql = getSql();
    try {
      return await deleteDraft(sql, context.userId, data.id);
    } finally {
      await sql.end();
    }
  });
