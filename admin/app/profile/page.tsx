import DashboardShell from "@/components/DashboardShell";
import ProfileEditor from "@/components/ProfileEditor";
import { readProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const profile = readProfile();
  return (
    <DashboardShell>
      <div className="h-full flex flex-col">
        <ProfileEditor initial={profile} />
      </div>
    </DashboardShell>
  );
}
