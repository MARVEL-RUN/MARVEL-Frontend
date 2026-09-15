import { DashboardPage } from "@/components/admin/dashboard/DashboardPage";
import { gaRealtimeOverviewUrl } from "@/lib/admin/analytics";

export default function Page() {
  return <DashboardPage gaRealtimeUrl={gaRealtimeOverviewUrl()} />;
}
