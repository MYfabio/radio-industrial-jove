import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Role } from "./settings.server";
import type { ClassRow } from "./classes.server";
import { describePgError } from "./pgError";

export type { ClassRow };

async function ensureAll(sql: import("./podcasts.server").Sql) {
  const { ensureSettingsSchema } = await import("./settings.server");
  const { ensureClassesSchema } = await import("./classes.server");
  await ensureSettingsSchema(sql);
  await ensureClassesSchema(sql);
}

export interface CreateClassInput {
  name: string;
}

export const createClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getOrCreateProfile } = await import("./settings.server");
    const { createClass } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      if ((profile.role as Role) === "alumne") {
        throw new Error("Només un docent o coordinador pot crear una classe.");
      }
      const name = data.name.trim();
      if (!name) throw new Error("Posa-hi un nom per a la classe.");
      return await createClass(sql, context.userId, name);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export const fetchMyClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { listClassesByOwner } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      return await listClassesByOwner(sql, context.userId);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface JoinClassInput {
  code: string;
}

export const joinClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: JoinClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { joinClassByCode } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const cls = await joinClassByCode(sql, context.userId, data.code);
      if (!cls) throw new Error("Aquest codi no correspon a cap classe.");
      return cls;
    } finally {
      await sql.end();
    }
  });
