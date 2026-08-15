import { useState } from "react";
import { LogOut, Settings, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { JoinClassDialog } from "./JoinClassDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.29 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.75l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.63l4.01 3.1c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

export function AuthButton() {
  const { user, role, classId, loading, signInWithGoogle, signOut } = useAuth();
  const [joinOpen, setJoinOpen] = useState(false);

  if (loading) {
    return <div className="size-8 shrink-0 animate-pulse rounded-full bg-secondary" />;
  }

  if (!user) {
    return (
      <button
        onClick={() => void signInWithGoogle()}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
      >
        <GoogleIcon />
        <span className="hidden sm:inline">Entra amb Google</span>
        <span className="sm:hidden">Entra</span>
      </button>
    );
  }

  const name = (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "";
  const avatarUrl = user.user_metadata?.["avatar_url"] as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 rounded-full outline-none ring-primary/50 focus-visible:ring-2">
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="max-w-48 truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {role === "coordinador" && (
            <DropdownMenuItem asChild>
              <Link to="/coordinador">
                <Settings className="size-4" /> Panell de coordinador
              </Link>
            </DropdownMenuItem>
          )}
          {role === "alumne" && !classId && (
            <DropdownMenuItem onClick={() => setJoinOpen(true)}>
              <Users className="size-4" /> Uneix-te a una classe
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="size-4" /> Surt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <JoinClassDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </>
  );
}
