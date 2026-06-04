import { listProjects } from "@/lib/projects";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const projects = listProjects();

  return (
    <DashboardShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Projets</h1>
            <p className="text-sm text-zinc-400 mt-1">{projects.length} projet{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau projet
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-2">Aucun projet</p>
            <Link href="/projects/new" className="text-xs text-amber-500 hover:text-amber-600">
              Créer le premier →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
              >
                {p.cover ? (
                  <img
                    src={`/api/media${p.cover}`}
                    alt=""
                    className="w-14 h-10 object-cover rounded-lg shrink-0 bg-zinc-100"
                  />
                ) : (
                  <div className="w-14 h-10 rounded-lg shrink-0 bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <svg className="size-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-amber-600 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{p.dates} · {p.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.technologies.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">{t}</span>
                  ))}
                  {p.technologies.length > 3 && (
                    <span className="text-[10px] text-zinc-400">+{p.technologies.length - 3}</span>
                  )}
                  <span className={`ml-1 w-2 h-2 rounded-full ${p.active ? "bg-green-400" : "bg-zinc-300"}`} title={p.active ? "Actif" : "Inactif"} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
