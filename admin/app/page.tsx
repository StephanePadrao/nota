import { listProjects } from "@/lib/projects";
import { listAlbums } from "@/lib/albums";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d: string) {
  if (!d) return "";
  const months = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const parts = d.split("-");
  if (parts.length < 3) return d;
  const [year, month, day] = parts;
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export default function DashboardPage() {
  const projects = listProjects();
  const albums = listAlbums();

  const activeProjects = projects.filter((p) => p.active);
  const totalPhotos = albums.reduce((n, a) => n + a.photoCount, 0);
  const recentProjects = projects.slice(0, 6);
  const recentAlbums = albums.slice(0, 6);

  return (
    <DashboardShell>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Bonjour 👋</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {projects.length + albums.length > 0
              ? `${projects.length} projet${projects.length > 1 ? "s" : ""} · ${albums.length} voyage${albums.length > 1 ? "s" : ""}`
              : "Aucun contenu pour l'instant"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Projets"
            value={projects.length}
            sub={`dont ${activeProjects.length} actif${activeProjects.length > 1 ? "s" : ""}`}
            color="amber"
          />
          <StatCard label="Voyages" value={albums.length} sub="albums photo" color="violet" />
          <StatCard label="Photos" value={totalPhotos} sub="dans les voyages" color="green" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Section title="Projets" href="/projects" newHref="/projects/new" newLabel="Nouveau projet" empty="Aucun projet">
            {recentProjects.map((p) => (
              <ContentCard
                key={p.slug}
                href={`/projects/${p.slug}`}
                cover={p.cover}
                title={p.title}
                subtitle={p.dates}
                badge={p.active ? "Actif" : "Archivé"}
                badgeActive={p.active}
              />
            ))}
          </Section>

          <Section title="Voyages" href="/albums" newHref="/albums/new" newLabel="Nouveau voyage" empty="Aucun voyage">
            {recentAlbums.map((a) => (
              <ContentCard
                key={a.slug}
                href={`/albums/${a.slug}`}
                cover={a.cover}
                title={a.title}
                subtitle={[a.location, formatDate(a.date)].filter(Boolean).join(" · ")}
                badge={`${a.photoCount} 📷`}
              />
            ))}
          </Section>
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({
  title, href, newHref, newLabel, empty, children,
}: {
  title: string; href: string; newHref: string; newLabel: string; empty: string; children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.filter(Boolean).length === 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{title}</h2>
        <Link href={href} className="text-xs text-amber-500 hover:text-amber-600 font-medium">
          Voir tout →
        </Link>
      </div>
      <div className="space-y-2">
        {!isEmpty && children}
        {isEmpty && (
          <div className="text-center py-10 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
            <p className="text-sm">{empty}</p>
            <Link href={newHref} className="text-xs text-amber-500 mt-1 inline-block hover:text-amber-600">
              {newLabel} →
            </Link>
          </div>
        )}
      </div>
      {!isEmpty && (
        <Link
          href={newHref}
          className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-dashed border-zinc-200 text-zinc-500 text-sm font-medium rounded-xl hover:border-amber-300 hover:text-amber-600 transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {newLabel}
        </Link>
      )}
    </div>
  );
}

function ContentCard({
  href, cover, title, subtitle, badge, badgeActive,
}: {
  href: string; cover?: string; title: string; subtitle: string; badge?: string; badgeActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
    >
      {cover ? (
        <img src={`/api/media${cover}`} alt="" className="w-12 h-9 object-cover rounded-lg shrink-0 bg-zinc-100" />
      ) : (
        <div className="w-12 h-9 rounded-lg shrink-0 bg-zinc-50 border border-zinc-100 flex items-center justify-center">
          <svg className="size-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-amber-600 transition-colors">{title}</p>
        {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
      </div>
      {badge && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
            badgeActive === false ? "bg-zinc-100 text-zinc-500" : "bg-green-100 text-green-600"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: number; sub: string; color: "green" | "amber" | "violet" | "zinc";
}) {
  const palette = {
    green: "bg-green-50 border-green-100",
    amber: "bg-amber-50 border-amber-100",
    violet: "bg-violet-50 border-violet-100",
    zinc: "bg-white border-zinc-200",
  };
  const text = {
    green: "text-green-700",
    amber: "text-amber-700",
    violet: "text-violet-700",
    zinc: "text-zinc-700",
  };
  return (
    <div className={`px-5 py-4 rounded-xl border ${palette[color]}`}>
      <p className={`text-3xl font-bold tabular-nums ${text[color]}`}>{value}</p>
      <p className="text-xs font-semibold text-zinc-700 mt-1">{label}</p>
      <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>
    </div>
  );
}
