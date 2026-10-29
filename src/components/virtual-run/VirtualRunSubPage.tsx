import { SideBanner } from "../main/layout/SideBanner";

export function VirtualRunSubPage({
  kicker,
  title,
  en,
  children,
}: {
  kicker: string;
  title: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page">
      <SideBanner kicker={kicker} title={title} en={en} />
      {children}
    </main>
  );
}
