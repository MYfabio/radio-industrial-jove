import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GraduationCap, Loader2, Check, X, Clock, Copy, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAllPodcasts, reviewPodcastFn, type PodcastRow } from "@/lib/podcasts.functions";
import { createClassFn, fetchMyClasses } from "@/lib/classes.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { notifyPodcastsChanged } from "@/lib/podcastSync";
import { useAuth } from "@/lib/auth";


export const Route = createFileRoute("/mestre")({
  head: () => ({
    meta: [
      { title: "Panell del mestre — Revisar pòdcasts de la classe" },
      {
        name: "description",
        content:
          "Escolta els pòdcasts pendents, deixa un comentari privat per a l'alumne i decideix quan surten al mur.",
      },
      { property: "og:title", content: `Panell del mestre — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Revisa, comenta i programa la publicació dels pòdcasts de la classe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPanel,
});

const BADGE: Record<string, string> = {
  pendent: "border-amber-500/50 bg-amber-500/15 text-amber-400",
  aprovat: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  rebutjat: "border-destructive/50 bg-destructive/15 text-destructive-foreground",
};
