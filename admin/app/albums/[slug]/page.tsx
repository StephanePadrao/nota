import { getAlbum } from "@/lib/albums";
import DashboardShell from "@/components/DashboardShell";
import AlbumEditor from "@/components/AlbumEditor";
import { notFound } from "next/navigation";

export default async function EditAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) notFound();

  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <AlbumEditor slug={slug} initialData={album} />
      </div>
    </DashboardShell>
  );
}
