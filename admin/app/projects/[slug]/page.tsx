import { getProject } from "@/lib/projects";
import DashboardShell from "@/components/DashboardShell";
import ProjectEditor from "@/components/ProjectEditor";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <ProjectEditor slug={slug} initialData={project} />
      </div>
    </DashboardShell>
  );
}
