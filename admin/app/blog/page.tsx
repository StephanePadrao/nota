import { listPosts } from "@/lib/blog";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = listPosts();

  return (
    <DashboardShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Blog</h1>
            <p className="text-sm text-zinc-400 mt-1">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvel article
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-2">Aucun article</p>
            <Link href="/blog/new" className="text-xs text-amber-500 hover:text-amber-600">
              Créer le premier →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
              >
                {p.cover ? (
                  <img src={`/api/media${p.cover}`} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0 bg-zinc-100" />
                ) : (
                  <div className="w-14 h-10 rounded-lg shrink-0 bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <svg className="size-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-amber-600 transition-colors">{p.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{p.date} · {p.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">{t}</span>
                  ))}
                  {p.draft && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full" title="Brouillon, caché du site">Brouillon</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
