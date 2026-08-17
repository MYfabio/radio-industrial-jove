import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteConfig";

export const Route = createFileRoute("/termes")({
  head: () => ({
    meta: [
      { title: `Condicions d'ús — ${SITE_NAME}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight">Condicions d'ús</h1>
            <p className="mt-1 text-xs text-muted-foreground">Darrera actualització: agost de 2026</p>
          </div>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Què és això</h2>
            <p>
              {SITE_NAME} és un recurs educatiu obert, gratuït per a qualsevol centre, perquè l'alumnat pugui
              gravar, editar i publicar pòdcasts escolars amb la supervisió del professorat.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Ús responsable</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Grava i publica només contingut respectuós, adequat a l'entorn escolar i amb la veu pròpia.</li>
              <li>No publiquis dades personals d'altres persones (adreces, telèfons, etc.) sense el seu permís.</li>
              <li>Els sons i la música de la galeria compartida s'han de fer servir amb bon criteri i respecte.</li>
              <li>El professorat revisa cada pòdcast abans que es publiqui al mur de la classe.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Moderació i retirada de contingut
            </h2>
            <p>
              El professorat i el coordinador o coordinadora del centre poden rebutjar o retirar en qualsevol
              moment un pòdcast que no compleixi aquestes condicions.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Disponibilitat del servei
            </h2>
            <p>
              Aquesta eina s'ofereix "tal qual", com a recurs educatiu, sense garantia de disponibilitat
              ininterrompuda. Es recomana descarregar una còpia dels pòdcasts importants.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Contacte</h2>
            <p>
              Per a qualsevol dubte sobre aquestes condicions, escriu a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . Consulta també la{" "}
              <Link to="/privacitat" className="text-accent hover:underline">
                política de privacitat
              </Link>{" "}
              i la pàgina d'{" "}
              <Link to="/ajuda" className="text-accent hover:underline">
                ajuda
              </Link>
              .
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
