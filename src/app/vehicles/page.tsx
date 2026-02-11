import { DashboardShell } from "@/components/layout/DashboardShell";
import { DirectoryContainer } from "@/components/dashboard/DirectoryContainer";
import { getZones } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Vehicle Ecosystem | LASPA Analytics",
    description: "Track registered vehicles and parking history.",
};

export default function VehiclesPage() {
    return (
        <DashboardShell>
            <VehiclesContent />
        </DashboardShell>
    );
}

async function VehiclesContent() {
    const zones = await getZones();
    return <DirectoryContainer zones={zones} initialMode="vehicles" />;
}
