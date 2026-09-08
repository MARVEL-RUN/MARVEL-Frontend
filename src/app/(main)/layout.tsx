import { isComingSoon } from "@/lib/mode";
import { MainShell } from "@/components/main/layout/MainShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isComingSoon) {
    return children;
  }

  return <MainShell>{children}</MainShell>;
}
