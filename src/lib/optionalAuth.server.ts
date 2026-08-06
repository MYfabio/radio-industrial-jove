/**
 * Igual que auth-middleware.ts, però no falla si no hi ha sessió: cal per a
 * rutes públiques (com el mur) que canvien de comportament si l'usuari ha
 * iniciat sessió amb el compte de Google del centre.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export interface OptionalAuthContext {
  userId: string | null;
  email: string | null;
}

async function resolveContext(): Promise<OptionalAuthContext> {
  const empty: OptionalAuthContext = { userId: null, email: null };

  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const authHeader = getRequest()?.headers?.get("authorization");

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !authHeader?.startsWith("Bearer ")) {
    return empty;
  }

  const token = authHeader.replace("Bearer ", "");
  if (token.split(".").length !== 3) return empty;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase.auth.getClaims(token);
    if (!data?.claims?.sub) return empty;
    return { userId: data.claims.sub, email: data.claims.email ?? null };
  } catch {
    return empty;
  }
}

export const optionalSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const context = await resolveContext();
    return next({ context });
  },
);
