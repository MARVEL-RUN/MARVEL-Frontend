import { TERMS, TERMS_EFFECTIVE } from "@/lib/legal";
import { SideBanner } from "../layout/SideBanner";
import { LegalSections } from "./LegalBlocks";

export function TermsPage() {
  return (
    <main className="page">
      <SideBanner kicker="TERMS" title="이용약관" en="TERMS OF USE" />
      <div className="page__body wrap wrap--narrow">
        <LegalSections sections={TERMS} effective={TERMS_EFFECTIVE} />
      </div>
    </main>
  );
}
