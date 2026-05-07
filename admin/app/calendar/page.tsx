"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import type { ArticleMeta } from "@/lib/articles";
import type { Idea } from "@/lib/ideas";

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
  const cells: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    fetch("/api/articles").then((r) => r.json()).then(setArticles);
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas);
  }, []);

  function prev() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const cells = getMonthGrid(year, month);

  const byDate = articles.reduce<Record<string, ArticleMeta[]>>((acc, a) => {
    const key = a.publishedAt;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const ideasByDate = ideas
    .filter((i) => i.targetDate)
    .reduce<Record<string, Idea[]>>((acc, i) => {
      const key = i.targetDate!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(i);
      return acc;
    }, {});

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monthArticles = articles.filter((a) => a.publishedAt.startsWith(`${year}-${pad(month + 1)}`));
  const published = monthArticles.filter((a) => !a.draft);
  const drafts = monthArticles.filter((a) => a.draft);

  return (
    <DashboardShell>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-zinc-900">Calendrier éditorial</h1>
          <Link
            href="/articles/new"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            + Nouvel article
          </Link>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          {MONTHS_FR[month]} {year}
          {" · "}
          {published.length} publié{published.length !== 1 ? "s" : ""}
          {drafts.length > 0 && ` · ${drafts.length} brouillon${drafts.length !== 1 ? "s" : ""}`}
        </p>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="font-semibold text-zinc-900">{MONTHS_FR[month]} {year}</span>
          <button
            onClick={next}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-100">
            {DAYS_FR.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-zinc-400 py-2.5">
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="min-h-16 border-b border-r border-zinc-50 last:border-r-0" />;

              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayArticles = byDate[dateStr] ?? [];
              const dayIdeas = ideasByDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`min-h-16 p-1.5 border-b border-r border-zinc-100 last:border-r-0 ${
                    isToday ? "bg-amber-50/50" : ""
                  }`}
                >
                  <span className={`text-xs font-medium block mb-1 ${
                    isToday
                      ? "w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center"
                      : "text-zinc-400"
                  }`}>
                    {day}
                  </span>
                  {dayArticles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/articles/${a.slug}`}
                      title={a.title}
                      className={`block truncate text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 transition-opacity hover:opacity-80 ${
                        a.draft
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {a.title || a.slug}
                    </Link>
                  ))}
                  {dayIdeas.map((i) => (
                    <Link
                      key={i.id}
                      href="/ideas"
                      title={`💡 ${i.title}`}
                      className="block truncate text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 bg-violet-100 text-violet-700 transition-opacity hover:opacity-80"
                    >
                      💡 {i.title}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-200 inline-block" />
            <span className="text-xs text-zinc-400">Publié</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-200 inline-block" />
            <span className="text-xs text-zinc-400">Brouillon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-100 border border-violet-200 inline-block" />
            <span className="text-xs text-zinc-400">Idée</span>
          </div>
        </div>

        {/* Month article list */}
        {monthArticles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Articles de {MONTHS_FR[month]}
            </h2>
            <div className="space-y-1.5">
              {monthArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all text-sm"
                >
                  <span className="text-zinc-400 font-mono text-xs w-6 text-right shrink-0">
                    {a.publishedAt.split("-")[2]}
                  </span>
                  <span className="flex-1 font-medium text-zinc-900 truncate">{a.title || a.slug}</span>
                  {a.draft ? (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full shrink-0">Brouillon</span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">Publié</span>
                  )}
                  {a.readingTime && <span className="text-xs text-zinc-300 shrink-0">{a.readingTime} min</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
