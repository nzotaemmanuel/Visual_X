import { DashboardShell } from "@/components/layout/DashboardShell";
import { DirectoryContainer } from "@/components/dashboard/DirectoryContainer";
import { getZones, getStaffList } from "@/lib/db";

export const metadata = {
    title: "Staff Management | LASPA Analytics",
    description: "Manage administrators, parking agents, and enforcement officers.",
};

export default function StaffPage() {
    return (
        <DashboardShell>
            <StaffContent />
        </DashboardShell>
    );
}

async function StaffContent() {
    const zones = await getZones();
    const staffList = await getStaffList();
    return <DirectoryContainer zones={zones} initialMode="staff" staffData={staffList} />;
}
