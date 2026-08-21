import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Role } from "./settings.server";
import type { SoundKind } from "./sounds.server";

export const fetchSounds = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("./podcasts.server");
  const { listSounds } = await import("./sounds.server");
  const sql = getSql();
  try {
    return await listSounds(sql);
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
