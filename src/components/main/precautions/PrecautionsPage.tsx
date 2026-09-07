import { PARTICIPANT_NOTICE } from "@/lib/legal";
import { PageHero } from "../layout/PageHero";
import { LegalBlocks } from "../legal/LegalBlocks";

export function PrecautionsPage() {
  return (
    <main className="page">
      <PageHero kicker="PROTOCOL" title="대회유의사항" en="BEFORE YOU RUN" />
      <div className="page__body wrap wrap--narrow">
        {PARTICIPANT_NOTICE.map((section) => (
          <section key={section.title} className="block">
            <h2>{section.title}</h2>
            <LegalBlocks nodes={section.nodes} />
          </section>
        ))}
      </div>
    </main>
  );
}
