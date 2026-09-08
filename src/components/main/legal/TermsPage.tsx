"use client";

import { TERMS, TERMS_EFFECTIVE } from "@/lib/legal";
import { draftLead, draftToSections, getLegalDoc } from "@/services/admin/legal";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { LegalSections } from "./LegalBlocks";

export function TermsPage() {
  const [sections, setSections] = useState(TERMS);
  const [lead, setLead] = useState<string[] | undefined>();
  const [effective, setEffective] = useState(TERMS_EFFECTIVE);

  useEffect(() => {
    void getLegalDoc("terms").then((draft) => {
      setSections(draftToSections(draft));
      setLead(draftLead(draft));
      setEffective(draft.effective);
    });
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="TERMS" title="이용약관" en="TERMS OF USE" />
      <div className="page__body wrap wrap--narrow">
        <LegalSections sections={sections} lead={lead} effective={effective} />
      </div>
    </main>
  );
}
