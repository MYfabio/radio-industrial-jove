/**
 * Enllaç «al mur» que porta cadascú al seu: qui ha iniciat sessió i té
 * escola va al mur de la seva escola (/escola/$slug); la resta, al mur obert
 * (/mur). Sense això, l'alumnat no tenia cap botó que el portés al mur de la
 * seva escola i acabava sempre al mur obert, on no hi ha els seus pòdcasts.
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { fetchMySchoolBasicsFn } from "@/lib/schools.functions";

/** Slug i nom de la ràdio de l'escola de qui ha iniciat sessió (o null). */
export function useMySchool() {
  const { user } = useAuth();
  const fetchSchool = useServerFn(fetchMySchoolBasicsFn);
  const { data } = useQuery({
    queryKey: ["my-school-basics"],
    queryFn: () => fetchSchool({}),
    enabled: !!user,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return user ? (data ?? null) : null;
}

export function WallLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const school = useMySchool();
  if (school) {
    return (
      <Link
        to="/escola/$slug"
        params={{ slug: school.slug }}
        className={className}
        title={school.radioName}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to="/mur" className={className}>
      {children}
    </Link>
  );
}
