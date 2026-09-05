import { isComingSoon } from "@/lib/mode";
import { ComingSoonPage } from "@/components/coming-soon";
import { HomePage } from "@/components/main/home/HomePage";
import { MainShell } from "@/components/main/layout/MainShell";

export default function Home() {
  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <MainShell>
      <HomePage />
    </MainShell>
  );
}
