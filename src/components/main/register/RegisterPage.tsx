import { registerUiOpen } from "@/lib/mode";
import { SideBanner } from "../layout/SideBanner";
import { RegisterClosed } from "./RegisterClosed";
import { RegisterFlow } from "./RegisterFlow";

export function RegisterPage() {
  return (
    <main className="page">
      <SideBanner kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
      <div className="page__body wrap wrap--narrow">
        {registerUiOpen ? <RegisterFlow /> : <RegisterClosed />}
      </div>
    </main>
  );
}