/**
 * Funcions de servidor (RPC) per gestionar els pòdcasts a Railway Postgres.
 * Aquest fitxer ha de ser només un embolcall prim: la lògica viu a podcasts.server.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { optionalSupabaseAuth } from "./optionalAuth.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { NewPodcast, PodcastEdit, PodcastRow } from "./podcasts.server";
import type { Role } from "./settings.server";
import { describePgError } from "./pgError";

export type { PodcastRow };

export interface PublishPodcastInput extends Omit<NewPodcast, "origin" | "classId" | "ownerId"> {}

/**
 * Si qui publica ha iniciat sessió, el pòdcast queda vinculat al seu compte
 * (per a "El meu espai") i, si pertany a una classe, es marca amb aquesta
 * classe automàticament (l'alumne no ho pot triar).
 */
export const insertPodcast = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: PublishPodcastInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql, createPodcast } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const { ensureClassesSchema } = await import("./classes.server");
    const origin = new URL(getRequest().url).origin;
    const sql = getSql();
    try {
      let classId: number | null = null;
      if (context.userId && context.email) {
        await ensureSettingsSchema(sql);
        await ensureClassesSchema(sql);
        const profile = await getOrCreateProfile(sql, context.userId, context.email);
        classId = profile.class_id;
      }
      return await createPodcast(sql, { ...data, classId, ownerId: context.userId, origin });
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/** "El meu espai": els pòdcasts que ha publicat l'usuari actual. */
export const fetchMyPodcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql, listMine } = await import("./podcasts.server");
    const sql = getSql();
    try {
      return await listMine(sql, context.userId);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface UpdatePodcastInput extends PodcastEdit {
  id: number;
}

export const updatePodcastFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdatePodcastInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql, updatePodcastFields } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      const { id, ...fields } = data;
      return await updatePodcastFields(sql, id, context.userId, (profile.role as Role) === "coordinador", fields);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface DeletePodcastInput {
  id: number;
}

export const deletePodcastFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DeletePodcastInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql, deletePodcastRow } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      return await deletePodcastRow(sql, data.id, context.userId, (profile.role as Role) === "coordinador");
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface ApprovedPodcastsResult {
  locked: boolean;
  allowedDomain: string | null;
  allowExternalSharing: boolean;
  items: PodcastRow[];
}

/** Mur obert (/mur): pòdcasts gravats fora de qualsevol classe, sempre públics. */
export const fetchApprovedPodcasts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ApprovedPodcastsResult> => {
    const { getSql, listApproved } = await import("./podcasts.server");
    const sql = getSql();
    try {
      const items = await listApproved(sql);
      return { locked: false, allowedDomain: null, allowExternalSharing: true, items };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  },
);

export interface SchoolWallInput {
  slug: string;
}

/**
 * Mur d'una escola (/escola/$slug). Si el coordinador no ha activat
 * "compartir fora de l'escola", cal haver iniciat sessió amb un correu del
 * domini de l'escola per veure'l.
 */
export const fetchSchoolWall = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: SchoolWallInput) => input)
  .handler(async ({ context, data }): Promise<ApprovedPodcastsResult & { radioName: string }> => {
    const { getSql, listApprovedForSchool } = await import("./podcasts.server");
    const { getSchoolBySlug } = await import("./schools.server");
    const sql = getSql();
    try {
      const school = await getSchoolBySlug(sql, data.slug);
      if (!school) throw new Error("Aquesta escola no existeix.");

      if (!school.allow_external_sharing && school.google_domain) {
        const domain = school.google_domain.toLowerCase();
        const email = context.email?.toLowerCase() ?? "";
        if (!email.endsWith(`@${domain}`)) {
          return {
            locked: true,
            allowedDomain: school.google_domain,
            allowExternalSharing: false,
            items: [],
            radioName: school.radio_name,
          };
        }
      }

      const items = await listApprovedForSchool(sql, school.id);
      return {
        locked: false,
        allowedDomain: school.google_domain,
        allowExternalSharing: school.allow_external_sharing,
        items,
        radioName: school.radio_name,
      };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface ClassWallInput {
  code: string;
}

/** Mur d'una classe (/classe/$code): sempre accessible amb el codi, sense cap altre filtre. */
export const fetchClassWall = createServerFn({ method: "GET" })
  .inputValidator((input: ClassWallInput) => input)
  .handler(async ({ data }): Promise<{ items: PodcastRow[]; className: string }> => {
    const { getSql, listApprovedForClass } = await import("./podcasts.server");
    const { getClassByInviteCode } = await import("./classes.server");
    const sql = getSql();
    try {
      const cls = await getClassByInviteCode(sql, data.code);
      if (!cls) throw new Error("Aquest codi no correspon a cap classe.");
      const items = await listApprovedForClass(sql, cls.id);
      return { items, className: cls.name };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/** Panell del mestre: pòdcasts de les classes pròpies (i de tota l'escola si ets coordinador). */
export const fetchAllPodcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql, listAll } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      if ((profile.role as Role) === "alumne") {
        throw new Error("Aquest panell només és per a docents o coordinadors.");
      }
      return await listAll(sql, context.userId, (profile.role as Role) === "coordinador", profile.school_id);
    } catch (err) {
      throw new Error(describePgError(err));
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
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
