"use client";

import { SideBanner } from "../layout/SideBanner";
import { RegisterClosed } from "./RegisterClosed";
import { RegisterFlow } from "./RegisterFlow";
import { useRegistrationOpen } from "./useRegistrationOpen";

export function RegisterPage() {
  const open = useRegistrationOpen();
  return (
    <main className="page">
      <SideBanner kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
      <div className="page__body wrap">
        {open ? <RegisterFlow /> : <RegisterClosed />}
      </div>
    </main>
  );
}
