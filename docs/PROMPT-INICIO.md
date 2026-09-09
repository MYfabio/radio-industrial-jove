# Prompt de arranque — Ràdio Escolar (radioescolar.cat)

Pegar al abrir una sesión nueva de Claude Code.

---

Proyecto **Ràdio Escolar** en `C:\Users\super\Desktop\APPS\Radio` —
repo `MYfabio/radio-industrial-jove`, dominio `https://www.radioescolar.cat`.

**Importante: el repo está conectado a Lovable.** Cada push a la rama conectada
se sincroniza con el editor de Lovable. No reescribas historia publicada (nada de
force push, rebase, amend ni squash de commits ya subidos) y deja siempre la rama
en estado funcional. Está en `AGENTS.md`.

**Qué es:** estudio de radio para alumnado. Graba con forma de onda visible y un
botón de grabación grande y fácil de parar, edita, monta pódcast con efectos y
música de fondo, y los publica en un muro por clase y por escuela. Recurso
educativo abierto: no pertenece a ningún centro concreto. Interfaz en catalán.

**Stack:** TanStack Start (React 19 + TanStack Router, SSR con Nitro) + Vite +
TypeScript · Tailwind v4 + shadcn/Radix · Supabase (auth + datos) y acceso
directo a Postgres con `postgres` · `@breezystack/lamejs` para MP3 ·
TanStack Query · zod.

**Estructura:**
```
src/routes/     index, estudi (estudio de grabación), espai, mur, classe.$code,
                escola.$slug, mestre, coordinador, superadmin, registre, ajuda,
                privacitat, termes, sitemap[.]xml, api/ai-edit,
                uneix.$code (enlace de invitación a una clase que comparte el docente)
src/lib/        pares *.server.ts (servidor) y *.functions.ts (cliente) por
                dominio: podcasts, classes, schools, sounds, favorites,
                settings, accessRequests
                audio: mp3, autoEdit, bgMusic, soundEffects, customSounds,
                podcastTemplates, publishPodcast, podcastSync
                siteConfig.ts  ← nombre, eslogan (en ca/es/en), URL y correo del centro
                i18n/          ← index.tsx (defineMessages/useT/tr, LangProvider), server.ts
                                 (idioma de la petición por cookie `radio-lang`),
                                 messages/*.ts (un diccionario por pantalla, ca+es+en juntos)
                importSheet.ts ← lectura de Excel/CSV (nombre, correo, rol, curso, aula)
                pendingJoin.ts ← código de clase pendiente mientras se entra con Google
src/components/ Waveform, LevelMeter, PublishPodcast, PodcastWall,
                JoinClassDialog (mis clases + código), AcceptTermsGate, CookieNotice,
                LangToggle (selector ca/es/en), SchoolMembers (roles con desplegable,
                quitar, invitar por correo, importar Excel, clases)…
src/integrations/supabase/  cliente, middleware y attacher de auth
supabase/migrations/        esquema
public/         efectos de sonido (mp3), favicon, robots.txt
```

**Comandos:**
```
npm i
npm run dev        # Vite dev
npm run build      # NITRO_PRESET=node-server
npm start          # node .output/server/index.mjs
npm run lint · npm run format
```

**Datos (Railway Postgres, tablas creadas por `ensure*Schema` al vuelo):**
profiles (rol, school_id, class_id = clase activa, display_name) · schools ·
classes (invite_code) · class_members (un alumno puede estar en varias clases /
subgrupos) · school_invites (correos dados de alta antes de entrar: al primer
login se les aplica escuela, rol y clase) · podcasts · favorites · access_requests.

**Idiomas:** la interfaz está en catalán, castellano e inglés. Todo texto visible
va en `src/lib/i18n/messages/<pantalla>.ts` con las tres traducciones juntas y se
consume con `useT(m)`; los errores de servidor usan `st()` de `i18n/server.ts`.
No dejes texto fijo en catalán en JSX nuevo.

**Reglas que no se rompen:**
- Para adaptar el proyecto a otro centro solo se toca `src/lib/siteConfig.ts`
  (nombre, eslogan, `SITE_URL`, correo de soporte). No hardcodees el nombre de
  la radio ni el dominio por el resto del código.
- Roles y sus guardas: alumno · docent · coordinador · superadmin. Comprueba el
  rol en el `*.server.ts`, no escondiendo botones.
- El alta de docente/coordinador y de centro pasa por `/registre`, con
  aprobación. No abras acceso automático.
- Menores: el muro y la publicación de pódcast son datos de alumnado. Sin
  nombres ni datos personales donde no toque; respeta `AcceptTermsGate`,
  `/termes` y `/privacitat`.
- El sitio sí se indexa (robots + sitemap apuntan a radioescolar.cat).
- Los mp3 de `public/` son efectos con licencia de Freesound y similares: no los
  sustituyas por material sin licencia clara.

**Cómo quiero que trabajes:**
1. Trabaja de forma autónoma, sin pedirme permiso paso a paso; ejecuta y resume.
2. Nunca reescribas historia de git (ver Lovable, arriba).
3. Cambios de esquema como migración nueva en `supabase/migrations/`.
4. Responde breve, en catalán o castellano.
