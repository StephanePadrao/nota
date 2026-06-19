import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

const done = [
  "Page /freelance dédiée (4 langues), titres et contenu ciblés sur les requêtes.",
  "Onglet « Freelance » dans la nav + maillage interne vers les études de cas.",
  "Données structurées : Person (expertise, formation, localisation) + ProfessionalService.",
  "Base technique : hreflang FR/EN/ES/PT, sitemap, canonical, OpenGraph, robots index/follow.",
];

const queries = [
  "freelance ingénieur électronique",
  "ingénieur électronique indépendant",
  "consultant industrialisation électronique",
  "conception carte électronique freelance",
  "freelance PCB",
  "expertise électronique",
  "+ Paris / Île-de-France",
];

export default function SeoPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">Stratégie SEO</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Être trouvé sur Google pour des recherches freelance. Aide-mémoire et actions à mener.
          </p>
        </header>

        <Card title="Le principe, et le réalisme">
          <ul className="space-y-2 text-sm text-zinc-600">
            <Li>
              <b>On vise la longue traîne de niche</b> (« freelance ingénieur électronique »,
              « consultant industrialisation »), pas « freelance » seul : ce mot est trusté par
              Malt, Upwork, Comet, impossible à déloger.
            </Li>
            <Li>
              <b>Le SEO met 3 à 6 mois</b> à porter, surtout pour un site récent. C&apos;est un
              actif de fond, pas un robinet à clients.
            </Li>
            <Li>
              <b>Pour des contacts rapides</b>, c&apos;est LinkedIn + Malt + réseau. Le site sert à
              convertir et crédibiliser, pas à attirer du trafic tout seul.
            </Li>
          </ul>
        </Card>

        <Card title="Déjà en place sur le site">
          <ul className="space-y-2 text-sm text-zinc-600">
            {done.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-0.5 text-green-500">✓</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Tes 3 leviers
          </h2>
          <div className="space-y-4">
            <Lever n={1} title="Google Search Console" badge="Mesure" badgeColor="zinc" time="≈ 15 min">
              <Steps
                items={[
                  <>
                    Va sur{" "}
                    <Ext href="https://search.google.com/search-console">
                      search.google.com/search-console
                    </Ext>
                    , connecte-toi avec un compte Google.
                  </>,
                  <>
                    « Ajouter une propriété » → <b>Préfixe d&apos;URL</b> →{" "}
                    <Code>https://spadrao.erro.cloud</Code>.
                  </>,
                  <>
                    Vérification : choisis <b>Balise HTML</b>. Google te donne un code{" "}
                    <Code>&lt;meta name=&quot;google-site-verification&quot; …&gt;</Code>.{" "}
                    <b>Donne-le à Claude</b>, il l&apos;ajoute au site et déploie, puis tu cliques
                    « Vérifier ».
                  </>,
                  <>
                    Menu <b>Sitemaps</b> → soumets <Code>sitemap-index.xml</Code>.
                  </>,
                  <>
                    Reviens dans ~1 semaine voir l&apos;onglet <b>Performances</b>.
                  </>,
                ]}
              />
            </Lever>

            <Lever n={2} title="Backlinks" badge="Le plus important" badgeColor="amber" time="≈ 30 min · gratuit">
              <p className="mb-3 text-sm text-zinc-600">
                Des liens d&apos;autres sites vers le tien = des votes de confiance pour Google. Un
                site neuf sans liens entrants rank très lentement, même avec un bon contenu.
              </p>
              <Steps
                items={[
                  <>
                    <b>LinkedIn</b> : mets l&apos;URL du site dans tes coordonnées (champ site web){" "}
                    <i>et</i> cite-la dans ta section « Infos ».
                  </>,
                  <>
                    <b>Malt</b> : crée ou complète ton profil freelance, ajoute le lien du site.
                  </>,
                  <>
                    <b>GitHub</b> : profil → champ « site web » → ton URL.
                  </>,
                  <>Quand tu postes sur LinkedIn, mets le lien vers la page correspondante du site.</>,
                ]}
              />
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                LinkedIn, Malt et GitHub sont des domaines très costauds : un lien depuis eux
                transfère de l&apos;autorité. C&apos;est ce qui débloque le ranking le plus vite.
              </p>
            </Lever>

            <Lever n={3} title="Domaine propre" badge="Optionnel" badgeColor="zinc" time="paie sur la durée">
              <p className="mb-3 text-sm text-zinc-600">
                Tu es sur <Code>spadrao.erro.cloud</Code> (un sous-domaine). Un domaine à toi (
                <Code>stephanepadrao.fr</Code> / <Code>.com</Code>) est plus crédible et accumule
                mieux l&apos;autorité.
              </p>
              <Steps
                items={[
                  <>Achète-le chez un registrar (OVH, Gandi, Namecheap, ~10-15 €/an).</>,
                  <>
                    <b>Préviens Claude</b> : config VPS (Nginx + SSL), redirection 301 de l&apos;ancien
                    vers le nouveau (garde le SEO acquis), bascule du site.
                  </>,
                ]}
              />
            </Lever>
          </div>
          <p className="mt-3 px-1 text-xs text-zinc-400">
            Ordre conseillé : <b>2</b> (gratuit, immédiat, le plus efficace) → <b>1</b> (pour
            mesurer) → <b>3</b> (quand tu veux).
          </p>
        </div>

        <Card title="Requêtes visées">
          <div className="flex flex-wrap gap-2">
            {queries.map((q) => (
              <span key={q} className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                {q}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Quand tu veux mon aide">
          <ul className="space-y-2 text-sm text-zinc-600">
            <Li>
              Donne-moi le <b>code de vérification Search Console</b> → je l&apos;ajoute au site et
              je déploie.
            </Li>
            <Li>
              Achète un <b>nom de domaine</b> → je câble la redirection 301 et la bascule.
            </Li>
            <Li>Besoin d&apos;autres pages ciblées (par expertise, par ville) ? Je les crée.</Li>
          </ul>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-300" />
      <span>{children}</span>
    </li>
  );
}

function Lever({
  n,
  title,
  badge,
  badgeColor,
  time,
  children,
}: {
  n: number;
  title: string;
  badge: string;
  badgeColor: "amber" | "zinc";
  time: string;
  children: ReactNode;
}) {
  const badgeCls = badgeColor === "amber" ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500";
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
          {n}
        </span>
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeCls}`}>{badge}</span>
        <span className="ml-auto text-[11px] text-zinc-400">{time}</span>
      </div>
      {children}
    </section>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2 text-sm text-zinc-600">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-500">
            {i + 1}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1 py-0.5 text-[12px] text-zinc-700">{children}</code>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
      {children}
    </a>
  );
}
