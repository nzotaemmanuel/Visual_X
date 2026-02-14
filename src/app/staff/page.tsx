import { DashboardShell } from "@/components/layout/DashboardShell";
import { DirectoryContainer } from "@/components/dashboard/DirectoryContainer";
import { getZones } from "@/app/actions/zones";
import { getStaffList } from "@/app/actions/staff";

export const dynamic = "force-dynamic";

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
    const staffResponse = await getStaffList();
    const staffList = staffResponse.success ? staffResponse.data : [];
    return <DirectoryContainer zones={zones} initialMode="staff" staffData={staffList} />;
}
