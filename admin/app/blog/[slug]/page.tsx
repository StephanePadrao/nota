import { getPost } from "@/lib/blog";
import DashboardShell from "@/components/DashboardShell";
import BlogEditor from "@/components/BlogEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <BlogEditor slug={slug} initialData={post} />
      </div>
    </DashboardShell>
  );
}
