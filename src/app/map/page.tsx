import { DashboardShell } from "@/components/layout/DashboardShell";
import { OperationsContainer } from "@/components/dashboard/OperationsContainer";
import { getZones } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Operations & Occupancy | LASPA Analytics",
    description: "Real-time bay utilization and field officer deployment.",
};

export default function MapPage() {
    return (
        <DashboardShell>
            <OperationsContent />
        </DashboardShell>
    );
}

async function OperationsContent() {
    const zones = await getZones();
    return <OperationsContainer zones={zones} />;
}
