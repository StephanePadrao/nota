"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";

const BLOG_URL = "https://spadrao.erro.cloud";

type Filter = "all" | "published" | "draft";

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
  if (days < 7) return `il y a ${days} j`;
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem`;
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an`;
}

export default function ArticlesList({ articles }: { articles: ArticleMeta[] }) {
  const [search, setSearch] = useState("");
  const [publishedSlugs, setPublishedSlugs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/build")
      .then((r) => r.json())
      .then((d) => {
        if (d.lastBuild?.publishedSlugs) setPublishedSlugs(d.lastBuild.publishedSlugs);
      })
      .catch(() => {});
  }, []);
  const [filter, setFilter] = useState<Filter>("all");

  const published = articles.filter((a) => !a.draft);
  const drafts = articles.filter((a) => a.draft);

  const filtered = useMemo(() => {
    let list = articles;
    if (filter === "published") list = published;
    if (filter === "draft") list = drafts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    }
    return list;
  }, [articles, filter, search]);

  const lastPublished = published[0];
  const lastPublishedAgo = lastPublished ? timeAgo(lastPublished.updatedAt ?? lastPublished.publishedAt) : null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Articles</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-green-600">{published.length} publié{published.length !== 1 ? "s" : ""}</span>
            {drafts.length > 0 && (
              <>
                {" · "}
                <span className="text-amber-500">{drafts.length} brouillon{drafts.length !== 1 ? "s" : ""}</span>
              </>
            )}
            {lastPublishedAgo && (
              <span className="text-zinc-300"> · dernière publication {lastPublishedAgo}</span>
            )}
          </p>
        </div>
        <Link
          href="/articles/new"
          className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          + Nouvel article
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
          {(["all", "published", "draft"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {f === "all" ? "Tous" : f === "published" ? "Publiés" : "Brouillons"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((article) => (
          <ArticleCard key={article.slug} article={article} isLiveAsDraft={article.draft === true && publishedSlugs.includes(article.slug)} />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            {search ? (
              <p>Aucun résultat pour « {search} »</p>
            ) : (
              <>
                <p>Aucun article{filter !== "all" ? ` dans cette catégorie` : ""} pour l'instant.</p>
                <Link href="/articles/new" className="mt-3 inline-block text-amber-500 hover:text-amber-600 text-sm">
                  Créer le premier article →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article, isLiveAsDraft }: { article: ArticleMeta; isLiveAsDraft?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative group bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/articles/${article.slug}`} className="flex items-stretch gap-4 p-4">
        {/* Thumbnail */}
        {article.image && !imgError ? (
          <img
            src={'/api/media' + article.image}
            alt=""
            className="w-20 h-14 object-cover rounded-lg shrink-0 bg-zinc-100"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-14 rounded-lg shrink-0 bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <svg className="size-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-medium text-zinc-900 truncate">{article.title || article.slug}</p>
            {article.draft ? (
              <span className={"shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide " + (isLiveAsDraft ? "bg-orange-100 text-orange-600" : "bg-amber-100 text-amber-600")}>
                {isLiveAsDraft ? "Brouillon — en ligne" : "Brouillon"}
              </span>
            ) : (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 rounded-full uppercase tracking-wide">
                Publié
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mb-1">
            {formatDate(article.publishedAt)}
            {article.readingTime && <span> · {article.readingTime} min de lecture</span>}
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <span className="text-zinc-300"> · modifié le {formatDate(article.updatedAt)}</span>
            )}
          </p>
          {article.summary && (
            <p className="text-sm text-zinc-400 truncate">{article.summary}</p>
          )}
        </div>

        <svg
          className="size-4 text-zinc-300 group-hover:text-zinc-500 shrink-0 self-center ml-2 transition-colors"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* Hover action: voir sur le blog */}
      {hovered && !article.draft && (
        <a
          href={`${BLOG_URL}/blog/${article.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-10 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white text-xs rounded-lg font-medium hover:bg-zinc-700 transition-colors"
        >
          Voir sur le blog
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}
    </div>
  );
}
