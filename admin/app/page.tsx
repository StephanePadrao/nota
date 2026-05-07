import { listArticles } from "@/lib/articles";
import { listIdeas } from "@/lib/ideas";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import type { IdeaStage } from "@/lib/ideas";

const STAGES: { id: IdeaStage; label: string; emoji: string }[] = [
  { id: "idee", label: "Idée", emoji: "💡" },
  { id: "preparation", label: "Préparation", emoji: "📋" },
  { id: "redaction", label: "Rédaction", emoji: "✏️" },
  { id: "revision", label: "Révision", emoji: "👀" },
  { id: "pret", label: "Prêt", emoji: "✅" },
];

function formatDate(d: string) {
  if (!d) return "";
  const months = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const [year, month, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function timeAgo(d: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d + "T00:00:00").getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days}j`;
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an`;
}

export default function DashboardPage() {
  const articles = listArticles();
  const ideas = listIdeas();

  const published = articles.filter((a) => !a.draft);
  const drafts = articles.filter((a) => a.draft);
  const recentArticles = articles.slice(0, 6);
  const today = new Date().toISOString().split("T")[0];

  const nextPlanned = ideas
    .filter((i) => i.targetDate && i.targetDate >= today)
    .sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
    .at(0);

  const lastPublished = published[0];

  return (
    <DashboardShell>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Bonjour 👋</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {lastPublished
              ? `Dernière publication ${timeAgo(lastPublished.updatedAt ?? lastPublished.publishedAt)} · ${formatDate(lastPublished.publishedAt)}`
              : "Aucun article publié pour l'instant"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Publiés" value={published.length} sub={`sur ${articles.length} articles`} color="green" />
          <StatCard label="Brouillons" value={drafts.length} sub="en cours d'écriture" color="amber" />
          <StatCard label="Idées" value={ideas.length} sub="dans le pipeline" color="violet" />
          <StatCard label="Prêts" value={ideas.filter((i) => i.stage === "pret").length} sub="à transformer en article" color="zinc" />
        </div>

        {/* 2-col content */}
        <div className="grid grid-cols-5 gap-6">
          {/* Recent articles — 3/5 */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Derniers articles</h2>
              <Link href="/articles" className="text-xs text-amber-500 hover:text-amber-600 font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-2">
              {recentArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
                >
                  {a.image ? (
                    <img src={`/api/media${a.image}`} alt="" className="w-12 h-9 object-cover rounded-lg shrink-0 bg-zinc-100" />
                  ) : (
                    <div className="w-12 h-9 rounded-lg shrink-0 bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                      <svg className="size-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-amber-600 transition-colors">
                      {a.title || a.slug}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatDate(a.publishedAt)}
                      {a.readingTime && <span> · {a.readingTime} min</span>}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                    a.draft ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                  }`}>
                    {a.draft ? "Brouillon" : "Publié"}
                  </span>
                </Link>
              ))}
              {recentArticles.length === 0 && (
                <div className="text-center py-10 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                  <p className="text-sm">Aucun article</p>
                  <Link href="/articles/new" className="text-xs text-amber-500 mt-1 inline-block hover:text-amber-600">
                    Créer le premier →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right col — 2/5 */}
          <div className="col-span-2 space-y-6">
            {/* Pipeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Pipeline</h2>
                <Link href="/ideas" className="text-xs text-amber-500 hover:text-amber-600 font-medium">
                  Gérer →
                </Link>
              </div>
              <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
                {STAGES.map((s, i) => {
                  const count = ideas.filter((idea) => idea.stage === s.id).length;
                  return (
                    <Link
                      key={s.id}
                      href="/ideas"
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors ${
                        i < STAGES.length - 1 ? "border-b border-zinc-50" : ""
                      }`}
                    >
                      <span className="text-sm">{s.emoji}</span>
                      <span className="flex-1 text-sm text-zinc-600">{s.label}</span>
                      <span className={`text-xs font-semibold tabular-nums ${count > 0 ? "text-zinc-700" : "text-zinc-300"}`}>
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Next planned idea */}
            {nextPlanned && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Prochaine date</h2>
                <Link href="/calendar" className="block px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl hover:border-violet-200 transition-colors">
                  <p className="text-xs text-violet-400 font-medium mb-1">{formatDate(nextPlanned.targetDate!)}</p>
                  <p className="text-sm font-medium text-violet-900 truncate">💡 {nextPlanned.title}</p>
                </Link>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Actions rapides</h2>
              <div className="space-y-2">
                <Link
                  href="/articles/new"
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Nouvel article
                </Link>
                <Link
                  href="/ideas"
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  Nouvelle idée
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
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
