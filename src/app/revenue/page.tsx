import { DashboardShell } from "@/components/layout/DashboardShell";
import { RevenueContainer } from "@/components/dashboard/RevenueContainer";
import { getZones } from "../actions/zones";

export const dynamic = "force-dynamic";

export default function RevenuePage() {
    return (
        <DashboardShell>
            <RevenueContent />
        </DashboardShell>
    );
}

async function RevenueContent() {
    const zones = await getZones();
    return <RevenueContainer zones={zones} />;
}
