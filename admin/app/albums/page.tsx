import { listAlbums } from "@/lib/albums";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d: string) {
  if (!d) return "";
  const months = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const [year, month, day] = d.split("-");
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export default function AlbumsPage() {
  const albums = listAlbums();

  return (
    <DashboardShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Albums photos</h1>
            <p className="text-sm text-zinc-400 mt-1">{albums.length} album{albums.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/albums/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvel album
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-2">Aucun album</p>
            <Link href="/albums/new" className="text-xs text-amber-500 hover:text-amber-600">
              Créer le premier →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {albums.map((a) => (
              <Link
                key={a.slug}
                href={`/albums/${a.slug}`}
                className="group block bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all overflow-hidden"
              >
                {a.cover ? (
                  <img src={`/api/media${a.cover}`} alt="" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center">
                    <svg className="size-8 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">{a.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {formatDate(a.date)}
                    {a.location && ` · ${a.location}`}
                    {" · "}{a.photoCount} photo{a.photoCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
