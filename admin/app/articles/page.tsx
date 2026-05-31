import { listArticles } from "@/lib/articles";
import DashboardShell from "@/components/DashboardShell";
import ArticlesList from "@/components/ArticlesList";

export const dynamic = "force-dynamic";

export default function ArticlesPage() {
  const articles = listArticles();
  return (
    <DashboardShell>
      <ArticlesList articles={articles} />
    </DashboardShell>
  );
}
