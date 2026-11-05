import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Role } from "./settings.server";
import type { SoundKind } from "./sounds.server";

/** Només els sons de qui ha iniciat sessió: la galeria no es comparteix. */
export const fetchSounds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { listSounds } = await import("./sounds.server");
    const sql = getSql();
    try {
      return await listSounds(sql, context.userId);
    } finally {
      await sql.end();
    }
  });

/** Àudio d'un so propi, en base64. */
export const fetchSoundDataFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getSoundData } = await import("./sounds.server");
    const sql = getSql();
    try {
      const found = await getSoundData(sql, data.id, context.userId);
      if (!found) throw new Error("So no trobat.");
      return { dataBase64: Buffer.from(found.data).toString("base64") };
    } finally {
      await sql.end();
    }
  });

export interface UploadSoundInput {
  name: string;
  emoji: string;
  mime: string;
  kind: SoundKind;
  dataBase64: string;
}

/** Cal haver iniciat sessió per pujar-hi un so nou (perquè tingui propietari). */
export const uploadSoundFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UploadSoundInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { createSound } = await import("./sounds.server");
    const sql = getSql();
    try {
      return await createSound(sql, { ...data, ownerId: context.userId });
    } finally {
      await sql.end();
    }
  });

export interface DeleteSoundInput {
  id: number;
}

export const deleteSoundFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DeleteSoundInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { deleteSound } = await import("./sounds.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      return await deleteSound(sql, data.id, context.userId, (profile.role as Role) === "coordinador");
    } finally {
      await sql.end();
    }
  });
