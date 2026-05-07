import { getArticle } from "@/lib/articles";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ArticleEditor from "@/components/ArticleEditor";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <ArticleEditor
          slug={slug}
          initialData={{
            title: article.title,
            publishedAt: article.publishedAt,
            summary: article.summary,
            image: article.image ?? "",
            body: article.body,
            draft: article.draft,
          }}
        />
      </div>
    </DashboardShell>
  );
}
