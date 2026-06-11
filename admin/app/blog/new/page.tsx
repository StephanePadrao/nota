import DashboardShell from "@/components/DashboardShell";
import BlogEditor from "@/components/BlogEditor";

export default function NewPostPage() {
  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <BlogEditor />
      </div>
    </DashboardShell>
  );
}
