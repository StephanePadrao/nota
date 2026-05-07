import { listArticles } from "@/lib/articles";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

export default function ArticlesPage() {
  const articles = listArticles();

  return (
    <DashboardShell>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">Articles</h1>
          <Link
            href="/articles/new"
            className="px-4 py-2 bg-amber-500 text-black text-sm font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            + Nouvel article
          </Link>
        </div>

        <div className="space-y-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
            >
              <div className="min-w-0">
                <p className="font-medium text-white truncate">
                  {article.title || article.slug}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {article.publishedAt || "Sans date"}{" "}
                  {article.summary && (
                    <span className="text-zinc-600">— {article.summary.slice(0, 60)}…</span>
                  )}
                </p>
              </div>
              <svg
                className="size-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-4 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}

          {articles.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <p>Aucun article pour l'instant.</p>
              <Link
                href="/articles/new"
                className="mt-4 inline-block text-amber-500 hover:text-amber-400 text-sm"
              >
                Créer le premier article →
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
