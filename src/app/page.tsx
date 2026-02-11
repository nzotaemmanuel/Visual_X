import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { getZones, getRecentOperations } from "./actions/zones";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <DashboardShell>
      <HomeContent />
    </DashboardShell>
  );
}

async function HomeContent() {
  const zones = await getZones();
  const recentOperations = await getRecentOperations(5);
  return <DashboardContainer zones={zones} recentOperations={recentOperations} />;
}
