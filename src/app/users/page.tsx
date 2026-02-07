import { DashboardShell } from "@/components/layout/DashboardShell";
import { DirectoryContainer } from "@/components/dashboard/DirectoryContainer";
import { getZones } from "@/lib/db";

export const metadata = {
    title: "User Management | LASPA Analytics",
    description: "Manage administrators, agents, and enforcement officers.",
};

export default function UsersPage() {
    return (
        <DashboardShell>
            <UsersContent />
        </DashboardShell>
    );
}

async function UsersContent() {
    const zones = await getZones();
    return <DirectoryContainer zones={zones} initialMode="users" />;
}
