"use client";

import { PRIVACY, PRIVACY_EFFECTIVE, PRIVACY_LEAD } from "@/lib/privacy";
import { draftLead, draftToSections, getLegalDoc } from "@/services/admin/legal";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { LegalSections } from "./LegalBlocks";

export function PrivacyPage() {
  const [sections, setSections] = useState(PRIVACY);
  const [lead, setLead] = useState<readonly string[]>(PRIVACY_LEAD);
  const [effective, setEffective] = useState(PRIVACY_EFFECTIVE);

  useEffect(() => {
    void getLegalDoc("privacy").then((draft) => {
      setSections(draftToSections(draft));
      setLead(draftLead(draft));
      setEffective(draft.effective);
    });
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="PRIVACY" title="개인정보 처리방침" en="PRIVACY POLICY" />
      <div className="page__body wrap wrap--narrow">
        <LegalSections sections={sections} lead={lead} effective={effective} />
      </div>
    </main>
  );
}
