import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { fetchMyProfile } from "./settings.functions";
import type { Role } from "./settings.server";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: Role | null;
  classId: number | null;
  schoolId: number | null;
  isSuperAdmin: boolean;
  termsAcceptedAt: string | null;
  declaredRole: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const [declaredRole, setDeclaredRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(() => {
    if (!session?.user) {
      setRole(null);
      setClassId(null);
      setSchoolId(null);
      setIsSuperAdmin(false);
      setTermsAcceptedAt(null);
      setDeclaredRole(null);
      return;
    }
    fetchMyProfile()
      .then((profile) => {
        setRole(profile.role as Role);
        setClassId(profile.class_id);
        setSchoolId(profile.school_id);
        setIsSuperAdmin(profile.is_super_admin);
        setTermsAcceptedAt(profile.terms_accepted_at);
        setDeclaredRole(profile.declared_role);
      })
      .catch(() => {
        setRole(null);
        setClassId(null);
        setSchoolId(null);
        setIsSuperAdmin(false);
        setTermsAcceptedAt(null);
        setDeclaredRole(null);
      });
  }, [session?.user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        role,
        classId,
        schoolId,
        isSuperAdmin,
        termsAcceptedAt,
        declaredRole,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
