import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { getZones } from "./actions/zones";

export default function Home() {
  return (
    <DashboardShell>
      <HomeContent />
    </DashboardShell>
  );
}

async function HomeContent() {
  const zones = await getZones();
  return <DashboardContainer zones={zones} />;
}
