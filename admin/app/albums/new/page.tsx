import DashboardShell from "@/components/DashboardShell";
import AlbumEditor from "@/components/AlbumEditor";

export default function NewAlbumPage() {
  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <AlbumEditor />
      </div>
    </DashboardShell>
  );
}
