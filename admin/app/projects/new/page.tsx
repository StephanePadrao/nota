import DashboardShell from "@/components/DashboardShell";
import ProjectEditor from "@/components/ProjectEditor";

export default function NewProjectPage() {
  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <ProjectEditor />
      </div>
    </DashboardShell>
  );
}
