import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SCHOOL_NAME, SCHOOL_CONTACT_EMAIL } from "@/lib/siteConfig";

export const Route = createFileRoute("/privacitat")({
  head: () => ({
    meta: [
      { title: `Política de privacitat — ${SITE_NAME}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="size-10" animated={false} />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </Link>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        <article className="space-y-6 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed sm:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Política de privacitat</h1>
            <p className="mt-1 text-xs text-muted-foreground">Darrera actualització: agost de 2026</p>
          </div>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Qui és el responsable de les dades
            </h2>
            <p>
              {SCHOOL_NAME} és qui gestiona {SITE_NAME}, l'estudi de ràdio i pòdcast de l'escola. Per qualsevol
              dubte sobre les teves dades pots escriure a{" "}
              <a href={`mailto:${SCHOOL_CONTACT_EMAIL}`} className="text-accent hover:underline">
                {SCHOOL_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Quines dades recollim
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Nom, correu electrònic i foto de perfil del teu compte de Google, quan inicies sessió.</li>
              <li>El teu rol (alumne, docent o coordinador/a) i la classe a la qual pertanys, si t'hi has unit.</li>
              <li>Els pòdcasts que graves i publiques: àudio, títol, descripció, categoria i caràtula.</li>
              <li>Els sons que puges a la galeria compartida de la classe.</li>
              <li>Els pòdcasts que marques com a preferits.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Pots fer servir l'estudi de gravació i escoltar el mur sense iniciar sessió: no cal donar cap dada
              personal per gravar i publicar un pòdcast de manera anònima.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Per què les fem servir
            </h2>
            <p>
              Únicament per al funcionament del projecte educatiu: identificar-te, mostrar el teu rol i classe,
              deixar que revisis i gestionis els teus propis pòdcasts a "El meu espai", i perquè el professorat
              pugui revisar i publicar els pòdcasts de la classe abans que surtin al mur.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">On es desen</h2>
            <p>
              Les dades es desen en una base de dades Postgres allotjada a Railway i la identificació es fa amb
              Supabase Auth (inici de sessió amb Google). No es venen ni es cedeixen a cap altra empresa amb
              finalitats comercials o publicitàries.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Qui pot veure els pòdcasts
            </h2>
            <p>
              Per defecte, el mur només és visible per a comptes del domini de l'escola. El coordinador o
              coordinadora del centre pot activar que el mur sigui públic per compartir els pòdcasts fora de
              l'escola; en aquest cas, els pòdcasts aprovats (àudio, títol, descripció i caràtula) esdevenen
              visibles per a qualsevol persona amb l'enllaç.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Els teus drets
            </h2>
            <p>
              Pots demanar en qualsevol moment veure, corregir o esborrar les teves dades i els teus pòdcasts.
              Des de "El meu espai" pots editar o esborrar els teus pòdcasts tu mateix/a. Per a qualsevol altra
              petició (per exemple, esborrar el teu compte per complet), escriu a{" "}
              <a href={`mailto:${SCHOOL_CONTACT_EMAIL}`} className="text-accent hover:underline">
                {SCHOOL_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Alumnat menor d'edat
            </h2>
            <p>
              L'ús d'aquesta eina a classe es fa sota la supervisió del professorat, dins del marc de consentiment
              que l'escola ja gestiona amb les famílies per a les eines digitals del centre.
            </p>
          </section>

          <Link to="/" className="inline-block text-sm font-semibold text-accent hover:underline">
            ← Torna a l'inici
          </Link>
        </article>
      </div>
    </main>
  );
}
