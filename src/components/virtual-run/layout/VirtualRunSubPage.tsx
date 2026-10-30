import { VirtualRunSideBanner } from "./VirtualRunSideBanner";

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
      <VirtualRunSideBanner kicker={kicker} title={title} en={en} />
      {children}
    </main>
  );
}
