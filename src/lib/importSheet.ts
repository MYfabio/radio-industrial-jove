/**
 * Lectura, al navegador, d'un full de càlcul (.xlsx o .csv) amb persones a
 * importar: nom, correu, rol, curs, aula. Detecta la capçalera si hi és
 * (en català, castellà o anglès); si no, suposa aquest ordre de columnes i
 * busca la columna del correu per la @.
 */
import type { ImportRow } from "./schools.functions";

export interface ParsedSheet {
  rows: ImportRow[];
  headerDetected: boolean;
}

type Cell = string | number | boolean | Date | null | undefined;

const HEADERS: Record<keyof ImportRow, string[]> = {
  name: [
    "nom",
    "nombre",
    "name",
    "nom i cognoms",
    "nombre y apellidos",
    "full name",
    "alumne",
    "alumno",
    "student",
    "persona",
  ],
  email: [
    "correu",
    "correu electronic",
    "email",
    "e-mail",
    "mail",
    "correo",
    "correo electronico",
    "adreça",
    "adreca",
    "usuari",
    "usuario",
  ],
  role: ["rol", "role", "tipus", "tipo", "type", "perfil"],
  course: [
    "curs",
    "curso",
    "course",
    "nivell",
    "nivel",
    "grade",
    "year",
    "etapa",
  ],
  classroom: [
    "aula",
    "grup",
    "grupo",
    "group",
    "classe",
    "clase",
    "class",
    "lletra",
    "letra",
    "seccio",
    "seccion",
    "section",
  ],
};

function normalize(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function normalizeHeader(value: Cell): string {
  return normalize(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .trim();
}

function detectHeader(
  row: Cell[],
): Partial<Record<keyof ImportRow, number>> | null {
  const map: Partial<Record<keyof ImportRow, number>> = {};
  row.forEach((cell, index) => {
    const h = normalizeHeader(cell);
    if (!h) return;
    for (const key of Object.keys(HEADERS) as (keyof ImportRow)[]) {
      if (map[key] === undefined && HEADERS[key].includes(h)) {
        map[key] = index;
        return;
      }
    }
  });
  // Sense columna de correu no és una capçalera que ens serveixi.
  return map.email !== undefined ? map : null;
}

function rowsToImport(rows: Cell[][]): ParsedSheet {
  const nonEmpty = rows.filter((r) => r.some((c) => normalize(c) !== ""));
  if (nonEmpty.length === 0) return { rows: [], headerDetected: false };

  const header = detectHeader(nonEmpty[0]!);
  let body = nonEmpty;
  let map: Record<keyof ImportRow, number | undefined>;
  if (header) {
    body = nonEmpty.slice(1);
    map = {
      name: header.name,
      email: header.email,
      role: header.role,
      course: header.course,
      classroom: header.classroom,
    };
  } else {
    // Sense capçalera: ordre nom, correu, rol, curs, aula — però la columna
    // del correu la busquem per la @ per si el full té un altre ordre.
    const width = Math.max(...body.map((r) => r.length));
    let emailCol = 1;
    let best = -1;
    for (let c = 0; c < width; c++) {
      const hits = body.filter((r) => normalize(r[c]).includes("@")).length;
      if (hits > best) {
        best = hits;
        emailCol = c;
      }
    }
    const others = [0, 1, 2, 3, 4].filter((c) => c !== emailCol);
    map = {
      email: emailCol,
      name: others[0],
      role: others[1],
      course: others[2],
      classroom: others[3],
    };
  }

  const pick = (r: Cell[], index: number | undefined) =>
    index === undefined ? "" : normalize(r[index]);
  const out: ImportRow[] = body
    .map((r) => ({
      name: pick(r, map.name),
      email: pick(r, map.email),
      role: pick(r, map.role),
      course: pick(r, map.course),
      classroom: pick(r, map.classroom),
    }))
    .filter((r) => r.email !== "");
  return { rows: out, headerDetected: header !== null };
}

function parseCsv(text: string): Cell[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0)
      ? firstLine.includes("\t") && !firstLine.includes(";")
        ? "\t"
        : ";"
      : ",";
  const rows: Cell[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export async function parseMembersFile(file: File): Promise<ParsedSheet> {
  const lower = file.name.toLowerCase();
  if (
    lower.endsWith(".csv") ||
    lower.endsWith(".txt") ||
    file.type === "text/csv"
  ) {
    const text = await file.text();
    return rowsToImport(parseCsv(text.replace(/^\uFEFF/, "")));
  }
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const rows = (await readXlsxFile(file)) as unknown as Cell[][];
  return rowsToImport(rows);
}

/** Plantilla CSV (amb ; com a separador, que és el que obre bé l'Excel en català/castellà). */
export function templateCsv(lang: "ca" | "es" | "en"): string {
  const header =
    lang === "es"
      ? "nombre;correo;rol;curso;aula"
      : lang === "en"
        ? "name;email;role;course;classroom"
        : "nom;correu;rol;curs;aula";
  const example =
    lang === "es"
      ? "Ana Pérez;ana.perez@escuela.org;alumno;1º ESO;A\nJordi Puig;jordi.puig@escuela.org;docente;;"
      : lang === "en"
        ? "Ana Perez;ana.perez@school.org;student;Year 7;A\nJordi Puig;jordi.puig@school.org;teacher;;"
        : "Anna Pérez;anna.perez@escola.org;alumne;1r ESO;A\nJordi Puig;jordi.puig@escola.org;docent;;";
  return `\uFEFF${header}\n${example}\n`;
}
