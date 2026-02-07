import { DashboardShell } from "@/components/layout/DashboardShell";
import { EnforcementContainer } from "@/components/dashboard/EnforcementContainer";
import { getZones } from "@/lib/db";

export const metadata = {
    title: "Enforcement & Compliance | LASPA Analytics",
    description: "Monitoring violations, clamps, and towing operations.",
};

export default function EnforcementPage() {
    return (
        <DashboardShell>
            <EnforcementContent />
        </DashboardShell>
    );
}

async function EnforcementContent() {
    const zones = await getZones();
    return <EnforcementContainer zones={zones} />;
}
