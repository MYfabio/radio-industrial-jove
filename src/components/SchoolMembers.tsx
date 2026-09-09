/**
 * Gestió de les persones d'un centre: canviar rols amb un desplegable,
 * treure-les, afegir-ne per correu, importar-ne des d'un full de càlcul i
 * veure/esborrar les classes. La fan servir el panell del coordinador (la
 * seva escola) i el del super admin (qualsevol escola, passant `schoolId`).
 * Els permisos es comproven al servidor (schools.functions.ts).
 */
import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  UserPlus,
  Users,
  Trash2,
  FileSpreadsheet,
  Download,
  Radio,
  Clock,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  assignRoleFn,
  setMemberRoleFn,
  removeMemberFn,
  deleteInviteFn,
  importMembersFn,
  type SchoolPeople,
  type MemberRole,
  type ImportRow,
} from "@/lib/schools.functions";
import { deleteClassFn } from "@/lib/classes.functions";
import type { ImportResult } from "@/lib/schools.server";
import { parseMembersFile, templateCsv } from "@/lib/importSheet";
import { useLang, useT, type Translate } from "@/lib/i18n";
import { panelsMessages as m } from "@/lib/i18n/messages/panels";

const ROLES: MemberRole[] = ["alumne", "docent", "coordinador"];

function roleLabel(t: Translate<typeof m>, role: string): string {
  if (role === "coordinador") return t("roleCoordinador");
  if (role === "docent") return t("roleDocent");
  return t("roleAlumne");
}

function RoleSelect({
  value,
  onChange,
  disabled,
  t,
}: {
  value: MemberRole;
  onChange: (role: MemberRole) => void;
  disabled?: boolean;
  t: Translate<typeof m>;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as MemberRole)}
      disabled={disabled ?? false}
    >
      <SelectTrigger
        className="h-8 w-[150px] text-xs"
        aria-label={t("colRole")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r} className="text-xs">
            {roleLabel(t, r)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SchoolMembersManager({
  data,
  selfUserId,
  schoolId,
  queryKey,
}: {
  data: SchoolPeople;
  selfUserId: string;
  /** Només el super admin: sobre quina escola s'actua. El coordinador sempre és la seva. */
  schoolId?: number;
  queryKey: readonly unknown[];
}) {
  const t = useT(m);
  const qc = useQueryClient();
  const assignRole = useServerFn(assignRoleFn);
  const setRole = useServerFn(setMemberRoleFn);
  const removeMember = useServerFn(removeMemberFn);
  const deleteInvite = useServerFn(deleteInviteFn);
  const deleteClass = useServerFn(deleteClassFn);
  const scope = schoolId !== undefined ? { schoolId } : {};

  const refresh = () => qc.invalidateQueries({ queryKey: [...queryKey] });

  // Afegir per correu
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("docent");
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const add = async () => {
    const value = email.trim().toLowerCase();
    if (!value) return;
    setAdding(true);
    setAddMessage(null);
    try {
      const { outcome } = await assignRole({
        data: { email: value, role: newRole, ...scope },
      });
      setAddMessage({
        ok: true,
        text: t(outcome === "updated" ? "addedUpdated" : "addedInvited", {
          email: value,
          role: roleLabel(t, newRole),
        }),
      });
      setEmail("");
      await refresh();
    } catch (e) {
      setAddMessage({
        ok: false,
        text: e instanceof Error ? e.message : t("unknownError"),
      });
    } finally {
      setAdding(false);
    }
  };

  // Canvi de rol / treure
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<{
    authUserId: string;
    email: string;
  } | null>(null);

  const changeRole = async (authUserId: string, role: MemberRole) => {
    setBusyId(authUserId);
    setRowError(null);
    try {
      await setRole({ data: { authUserId, role, ...scope } });
      await refresh();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    const { authUserId } = toRemove;
    setToRemove(null);
    setBusyId(authUserId);
    setRowError(null);
    try {
      await removeMember({ data: { authUserId, ...scope } });
      await refresh();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setBusyId(null);
    }
  };

  const cancelInvite = async (inviteId: number) => {
    setBusyId(`invite-${inviteId}`);
    setRowError(null);
    try {
      await deleteInvite({ data: { inviteId, ...scope } });
      await refresh();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setBusyId(null);
    }
  };

  // Filtre
  const [filter, setFilter] = useState("");
  const members = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return data.members;
    return data.members.filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        (p.display_name ?? "").toLowerCase().includes(q) ||
        (p.class_name ?? "").toLowerCase().includes(q),
    );
  }, [data.members, filter]);

  // Classes
  const [classToDelete, setClassToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [classError, setClassError] = useState<string | null>(null);

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    const { id } = classToDelete;
    setClassToDelete(null);
    setClassError(null);
    try {
      await deleteClass({ data: { classId: id } });
      await refresh();
    } catch (e) {
      setClassError(e instanceof Error ? e.message : t("unknownError"));
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <UserPlus className="size-4" /> {t("membersTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("membersIntro")}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="max-w-xs"
            onKeyDown={(e) => e.key === "Enter" && void add()}
          />
          <RoleSelect value={newRole} onChange={setNewRole} t={t} />
          <Button
            size="sm"
            onClick={() => void add()}
            disabled={adding || !email.trim()}
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {t("addButton")}
          </Button>
        </div>
        {addMessage && (
          <p
            className={`text-sm ${addMessage.ok ? "text-muted-foreground" : "text-destructive-foreground"}`}
          >
            {addMessage.text}
          </p>
        )}

        {data.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMembers")}</p>
        ) : (
          <>
            {data.members.length > 8 && (
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t("filterPlaceholder")}
                  className="pl-8"
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-1.5 pr-3 font-semibold">
                      {t("colPerson")}
                    </th>
                    <th className="py-1.5 pr-3 font-semibold">
                      {t("colClass")}
                    </th>
                    <th className="py-1.5 pr-3 font-semibold">
                      {t("colRole")}
                    </th>
                    <th className="py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((p) => {
                    const isSelf = p.auth_user_id === selfUserId;
                    const busy = busyId === p.auth_user_id;
                    return (
                      <tr
                        key={p.auth_user_id}
                        className="border-t border-border/60"
                      >
                        <td className="max-w-[260px] py-2 pr-3">
                          <p className="truncate font-medium">
                            {p.display_name ?? p.email}
                            {isSelf && (
                              <span className="ml-2 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                                {t("you")}
                              </span>
                            )}
                          </p>
                          {p.display_name && (
                            <p className="truncate text-xs text-muted-foreground">
                              {p.email}
                            </p>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {p.class_name ?? (
                            <span className="text-xs">{t("noClass")}</span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          {isSelf ? (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {roleLabel(t, p.role)}
                            </span>
                          ) : (
                            <RoleSelect
                              value={
                                (ROLES.includes(p.role as MemberRole)
                                  ? p.role
                                  : "alumne") as MemberRole
                              }
                              onChange={(role) =>
                                void changeRole(p.auth_user_id, role)
                              }
                              disabled={busy}
                              t={t}
                            />
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {!isSelf && (
                            <button
                              onClick={() =>
                                setToRemove({
                                  authUserId: p.auth_user_id,
                                  email: p.email,
                                })
                              }
                              disabled={busy}
                              title={t("removeMember")}
                              aria-label={t("removeMember")}
                              className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {rowError && (
          <p className="text-sm text-destructive-foreground">{rowError}</p>
        )}

        {data.invites.length > 0 && (
          <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />{" "}
              {t("pendingTitle", { count: data.invites.length })}
            </p>
            <p className="text-xs text-muted-foreground">{t("pendingHint")}</p>
            <ul className="space-y-1 text-sm">
              {data.invites.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="min-w-0 truncate">
                    {i.display_name ? `${i.display_name} · ` : ""}
                    <span className="text-muted-foreground">{i.email}</span>
                    {i.class_name && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {i.class_name}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {roleLabel(t, i.role)}
                    </span>
                    <button
                      onClick={() => void cancelInvite(i.id)}
                      disabled={busyId === `invite-${i.id}`}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                    >
                      {t("deleteInvite")}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ImportMembers
        scope={scope}
        onImported={refresh}
        classNames={data.classes.map((c) => c.name)}
      />

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="size-4" />{" "}
          {t("classesTitle", { count: data.classes.length })}
        </h2>
        {data.classes.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("noClassesYet")}</p>
        )}
        {data.classes.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.classes.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm font-semibold">
                  {c.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {t("membersCount", { count: data.classMembers[c.id] ?? 0 })}
                  </span>
                  {c.share_to_school && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                      <Radio className="size-2.5" /> {t("schoolWallBadge")}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Link
                    to="/classe/$code"
                    params={{ code: c.invite_code }}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent/10"
                  >
                    {t("wall")}
                  </Link>
                  <button
                    onClick={() => setClassToDelete({ id: c.id, name: c.name })}
                    title={t("deleteClass")}
                    aria-label={t("deleteClass")}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
        {classError && (
          <p className="text-sm text-destructive-foreground">{classError}</p>
        )}
      </section>

      <AlertDialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("removeConfirmTitle", { email: toRemove?.email ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeConfirmText")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRemove()}>
              {t("removeMember")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={classToDelete !== null}
        onOpenChange={(open) => !open && setClassToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteClassConfirmTitle", {
                name: classToDelete?.name ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteClassConfirmText")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDeleteClass()}>
              {t("deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ImportMembers({
  scope,
  onImported,
  classNames,
}: {
  scope: { schoolId?: number };
  onImported: () => Promise<unknown>;
  classNames: string[];
}) {
  const t = useT(m);
  const { lang } = useLang();
  const importMembers = useServerFn(importMembersFn);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [headerDetected, setHeaderDetected] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFileName(null);
    setRows([]);
    setHeaderDetected(false);
    setParseError(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    try {
      const parsed = await parseMembersFile(file);
      if (parsed.rows.length === 0) {
        setParseError(t("noRows"));
        return;
      }
      setRows(parsed.rows);
      setHeaderDetected(parsed.headerDetected);
    } catch {
      setParseError(t("parseError"));
    }
  };

  const run = async () => {
    if (rows.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await importMembers({ data: { rows, ...scope } });
      setResult(res);
      setRows([]);
      await onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv(lang)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      lang === "es"
        ? "plantilla-alumnos.csv"
        : lang === "en"
          ? "students-template.csv"
          : "plantilla-alumnes.csv";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const preview = rows.slice(0, 8);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <FileSpreadsheet className="size-4" /> {t("importTitle")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("importIntro")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <FileSpreadsheet className="size-4" /> {t("chooseFile")}
        </Button>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          <Download className="size-3.5" /> {t("downloadTemplate")}
        </button>
        {fileName && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {fileName}
            <button
              onClick={reset}
              aria-label={t("clearFile")}
              title={t("clearFile")}
              className="rounded-full p-0.5 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
        )}
      </div>
      {parseError && (
        <p className="text-sm text-destructive-foreground">{parseError}</p>
      )}

      {rows.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
          <p className="text-sm font-semibold">
            {t("previewTitle", { count: rows.length })}{" "}
            <span className="font-normal text-muted-foreground">
              {headerDetected ? t("previewHeaderYes") : t("previewHeaderNo")}
            </span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left uppercase tracking-wider text-muted-foreground">
                  <th className="py-1 pr-3 font-semibold">{t("colName")}</th>
                  <th className="py-1 pr-3 font-semibold">{t("colEmail")}</th>
                  <th className="py-1 pr-3 font-semibold">{t("colRole")}</th>
                  <th className="py-1 pr-3 font-semibold">{t("colCourse")}</th>
                  <th className="py-1 font-semibold">{t("colClassroom")}</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="py-1 pr-3">{r.name}</td>
                    <td className="py-1 pr-3">{r.email}</td>
                    <td className="py-1 pr-3">
                      {r.role || t("roleAlumne").toLowerCase()}
                    </td>
                    <td className="py-1 pr-3">{r.course}</td>
                    <td className="py-1">{r.classroom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > preview.length && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("previewMore", { count: rows.length - preview.length })}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => void run()} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {busy ? t("importing") : t("importButton", { count: rows.length })}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive-foreground">{error}</p>}

      {result && (
        <div className="space-y-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
          <p className="font-semibold">{t("importDone")}</p>
          <p>{t("resultUpdated", { count: result.updated })}</p>
          <p>{t("resultInvited", { count: result.invited })}</p>
          {result.classesCreated.length > 0 && (
            <p>
              {t("resultClasses", { list: result.classesCreated.join(", ") })}
            </p>
          )}
          {result.errors.length > 0 && (
            <div className="text-destructive-foreground">
              <p>{t("resultErrors", { count: result.errors.length })}</p>
              <ul className="ml-4 list-disc">
                {result.errors.slice(0, 20).map((e) => (
                  <li key={`${e.row}-${e.email}`}>
                    {t(e.reason === "email" ? "errorEmail" : "errorRole", {
                      row: e.row,
                      email: e.email,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {classNames.length > 0 && rows.length === 0 && !result && null}
    </section>
  );
}
