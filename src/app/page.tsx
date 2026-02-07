import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { getZones, getRecentOperations } from "./actions/zones";

export default function Home() {
  return (
    <DashboardShell>
      <HomeContent />
    </DashboardShell>
  );
}

async function HomeContent() {
  const zones = await getZones();
  const recentOperations = await getRecentOperations();
  return <DashboardContainer zones={zones} recentOperations={recentOperations} />;
}
