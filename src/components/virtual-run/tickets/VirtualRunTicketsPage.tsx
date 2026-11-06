"use client";

import { useEffect, useState } from "react";
import { ApplyTerms } from "@/components/main/register/ApplyTerms";
import { EMPTY_CONSENTS, type Consents } from "@/lib/register";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VirtualRunPackageForm } from "./VirtualRunPackageForm";

export function VirtualRunTicketsPage() {
  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [agreed]);

  if (!agreed) {
    return (
      <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
        <div className="page__body wrap">
          <ApplyTerms
            values={consents}
            onChange={setConsents}
            onPick={() => {
              setAgreed(true);
            }}
            allowedKinds={["individual"]}
            actionLabels={{ individual: "동의하고 패키지 선택" }}
          />
        </div>
      </VirtualRunSubPage>
    );
  }

  return (
    <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
      <div className="page__body wrap vr-ticket-stage">
        <VirtualRunPackageForm
          consents={consents}
          onBack={() => {
            setAgreed(false);
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    </VirtualRunSubPage>
  );
}
