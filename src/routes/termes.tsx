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
              {SITE_NAME} és un recurs educatiu obert i gratuït, sense ànim de lucre, perquè qualsevol centre
              pugui fer que el seu alumnat gravi, editi i publiqui pòdcasts escolars. És una eina tècnica: cada
              centre en fa un ús propi, sempre sota la supervisió del seu propi professorat.
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">Ús responsable</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Grava i publica només contingut respectuós, adequat a l'entorn escolar i amb la veu pròpia.</li>
              <li>No publiquis dades personals d'altres persones (adreces, telèfons, etc.) sense el seu permís.</li>
              <li>Els sons i la música de la galeria compartida s'han de fer servir amb bon criteri i respecte.</li>
              <li>El professorat revisa cada pòdcast abans que es publiqui a qualsevol mur.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Responsabilitat i supervisió educativa
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                {SITE_NAME} no revisa ni modera automàticament cap contingut: només es publica un pòdcast
                quan un docent l'aprova. La responsabilitat sobre el contingut gravat i sobre la decisió
                d'aprovar-lo i publicar-lo és de qui l'ha gravat i del professorat que l'ha aprovat.
              </li>
              <li>
                El coordinador o coordinadora de cada centre decideix si el mur del seu centre és públic i a
                qui dona permís de docent. Aquesta decisió, i el compliment de la normativa de protecció de
                dades i de drets d'imatge/veu de l'alumnat menor d'edat (inclosos els consentiments amb les
                famílies), és responsabilitat del centre educatiu, no de qui manté tècnicament aquesta eina.
              </li>
              <li>
                {SITE_NAME} no és una eina d'avaluació ni de qualificació: no puntua, corregeix ni certifica
                cap contingut. Qualsevol avaluació acadèmica del treball de l'alumnat correspon exclusivament
                al professorat, fora d'aquesta plataforma.
              </li>
              <li>
                En cas d'ús indegut de l'eina o de publicació de contingut que incompleixi aquestes
                condicions, la responsabilitat recau sobre qui l'ha publicat i sobre el centre educatiu que
                en supervisa l'ús — no sobre qui ofereix tècnicament aquesta eina, que actua únicament com a
                proveïdor del recurs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Moderació i retirada de contingut
            </h2>
            <p>
              El professorat i el coordinador o coordinadora del centre poden rebutjar o retirar en qualsevol
              moment un pòdcast que no compleixi aquestes condicions. Si algú detecta contingut inadequat que
              no s'ha retirat, pot escriure a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              Disponibilitat del servei i límits de responsabilitat
            </h2>
            <p>
              Aquesta eina s'ofereix "tal qual", com a recurs educatiu gratuït, sense garantia de
              disponibilitat ininterrompuda ni de conservació indefinida del contingut. Es recomana descarregar
              una còpia dels pòdcasts importants. Qui manté tècnicament {SITE_NAME} no es fa responsable dels
              danys, perjudicis o conseqüències derivats de l'ús o mal ús que en facin els centres, el
              professorat o l'alumnat, ni del contingut que hi publiquin.
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
