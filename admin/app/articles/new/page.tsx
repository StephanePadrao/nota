import DashboardShell from "@/components/DashboardShell";
import ArticleEditor from "@/components/ArticleEditor";

export default function NewArticlePage() {
  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <ArticleEditor />
      </div>
    </DashboardShell>
  );
}
