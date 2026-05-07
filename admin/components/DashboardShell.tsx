"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900 px-4 py-6">
        <div className="mb-8">
          <span className="text-white font-semibold text-sm">Nota Admin</span>
        </div>
        <nav className="flex-1 space-y-1">
          <Link
            href="/articles"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith("/articles")
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Articles
          </Link>
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
