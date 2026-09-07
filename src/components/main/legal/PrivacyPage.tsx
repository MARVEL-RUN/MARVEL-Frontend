import { PRIVACY, PRIVACY_EFFECTIVE, PRIVACY_LEAD } from "@/lib/privacy";
import { PageHero } from "../layout/PageHero";
import { LegalSections } from "./LegalBlocks";

export function PrivacyPage() {
  return (
    <main className="page">
      <PageHero kicker="PRIVACY" title="개인정보 처리방침" en="PRIVACY POLICY" />
      <div className="page__body wrap wrap--narrow">
        <LegalSections
          sections={PRIVACY}
          lead={PRIVACY_LEAD}
          effective={PRIVACY_EFFECTIVE}
        />
      </div>
    </main>
  );
}
