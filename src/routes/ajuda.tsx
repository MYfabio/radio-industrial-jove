import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteConfig";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: `Ajuda — ${SITE_NAME}` },
      {
        name: "description",
        content: "Com funciona Ràdio Escolar: gravació, revisió, escoles, docents i murs de pòdcasts.",
      },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
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
            <h1 className="text-2xl font-bold tracking-tight">Ajuda</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Com funciona {SITE_NAME}, pas a pas.
            </p>
          </div>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Què és i per què és gratuït
            </h2>
            <p>
              {SITE_NAME} és un recurs educatiu obert i sense ànim de lucre: qualsevol centre el pot fer
              servir sense pagar res. Neix amb un objectiu senzill — que l'alumnat practiqui l'expressió
              oral i la comprensió llegint, escrivint i gravant amb la seva pròpia veu, i que això es faci
              en català. Gravar un pòdcast a classe és una manera pràctica i motivadora de treballar la
              llengua: cal preparar un guió, llegir-lo bé en veu alta i escoltar-se, i el resultat es pot
              compartir amb la resta de la classe o del centre. Com que és un projecte obert, no hi ha
              publicitat ni recollida de dades amb finalitats comercials — només el que cal per fer
              funcionar l'eina (consulta la{" "}
              <Link to="/privacitat" className="text-accent hover:underline">
                política de privacitat
              </Link>
              ).
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Per a l'alumnat
            </h2>
            <p>
              Des de{" "}
              <Link to="/estudi" className="text-accent hover:underline">
                l'estudi
              </Link>{" "}
              pots triar una plantilla de guió, gravar la teva veu (amb efectes de so i música de fons si
              vols) i publicar-lo. El pòdcast queda en estat <em>pendent</em> fins que el professor o
              professora el revisa; un cop aprovat, apareix al mur corresponent. Si t'has unit a una
              classe amb un codi d'invitació, el teu pòdcast es vincula automàticament a aquella classe.
              Des de <strong>"El meu espai"</strong> pots veure l'estat de tot el que has publicat, editar
              el títol o les etiquetes, i consultar els comentaris privats que t'hagi deixat el
              professorat.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Per al professorat (docent)
            </h2>
            <p>
              Només un <strong>docent</strong> o un <strong>coordinador/a</strong> pot crear classes —
              l'alumnat no ho pot fer. Si ets professor o professora d'un centre donat d'alta i encara no
              tens permís de docent, demana al coordinador o coordinadora del teu centre que te'l doni des
              del seu panell (cal haver iniciat sessió amb Google almenys un cop perquè et pugui trobar).
            </p>
            <p className="mt-2">
              Des del <strong>Panell del mestre</strong> crees classes (cadascuna amb un codi d'invitació
              de 6 caràcters per als alumnes), revises els pòdcasts pendents, hi deixes un comentari privat
              i decideixes quan surten publicats — de seguida o programats per a una data concreta. També
              pots retirar un pòdcast del mur en qualsevol moment.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Escoles i coordinadors
            </h2>
            <p>
              Un centre es dona d'alta a la plataforma pel seu domini de Google (per exemple,
              @elteucentre.org). A partir d'aquí, el coordinador o coordinadora d'aquest centre pot posar
              nom a la seva ràdio, decidir si el mur de l'escola és públic o només visible amb un compte
              del centre, i donar permís de docent a la resta de professorat. Un docent que no pertanyi a
              cap centre donat d'alta pot igualment crear classes pel seu compte, amb el seu propi mur
              independent.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Els murs: on es veuen els pòdcasts
            </h2>
            <p>Hi ha tres nivells, segons com es vulgui difondre cada pòdcast:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Mur d'una classe</strong> (<code>/classe/codi</code>): sempre accessible amb el
                codi de la classe, pensat per compartir amb famílies o altres classes concretes.
              </li>
              <li>
                <strong>Mur d'una escola</strong> (<code>/escola/nom</code>): reuneix els pòdcasts de les
                classes que el docent hagi triat compartir-hi. El coordinador o coordinadora decideix si
                aquest mur és totalment públic o només visible amb un compte del centre.
              </li>
              <li>
                <strong>Mur obert</strong> (<code>/mur</code>): els pòdcasts gravats sense estar vinculats
                a cap classe, sempre públics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Preguntes freqüents
            </h2>
            <div className="mt-2 space-y-3">
              <div>
                <p className="font-semibold">El navegador no em deixa fer servir el micròfon.</p>
                <p className="text-muted-foreground">
                  Revisa els permisos del lloc al navegador (sol aparèixer una icona de cadenat o de
                  micròfon a la barra d'adreces) i dona permís de micròfon. Cal tornar a carregar la
                  pàgina després.
                </p>
              </div>
              <div>
                <p className="font-semibold">
                  Quan activo un efecte de so, es perd o es baixa la meva veu a la gravació.
                </p>
                <p className="text-muted-foreground">
                  Si graves amb altaveus (no auriculars), el micròfon capta el mateix efecte que surt pels
                  altaveus. Fes servir auriculars mentre graves per evitar-ho.
                </p>
              </div>
              <div>
                <p className="font-semibold">El meu pòdcast no apareix a cap mur.</p>
                <p className="text-muted-foreground">
                  Els pòdcasts han de ser revisats i aprovats pel professorat abans de sortir publicats.
                  Consulta l'estat a "El meu espai".
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Contacte</h2>
            <p>
              Per a qualsevol dubte, escriu a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . Consulta també la{" "}
              <Link to="/privacitat" className="text-accent hover:underline">
                política de privacitat
              </Link>{" "}
              i les{" "}
              <Link to="/termes" className="text-accent hover:underline">
                condicions d'ús
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
