import { TERMS, TERMS_EFFECTIVE } from "@/lib/legal";
import { PageHero } from "../layout/PageHero";
import { LegalSections } from "./LegalBlocks";

export function TermsPage() {
  return (
    <main className="page">
      <PageHero kicker="TERMS" title="이용약관" en="TERMS OF USE" />
      <div className="page__body wrap wrap--narrow">
        <LegalSections sections={TERMS} effective={TERMS_EFFECTIVE} />
      </div>
    </main>
  );
}
