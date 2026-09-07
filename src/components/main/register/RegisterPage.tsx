import { registerUiOpen } from "@/lib/mode";
import { PageHero } from "../layout/PageHero";
import { RegisterClosed } from "./RegisterClosed";
import { RegisterFlow } from "./RegisterFlow";

export function RegisterPage() {
  return (
    <main className="page">
      <PageHero kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
      <div className="page__body wrap wrap--narrow">
        {registerUiOpen ? <RegisterFlow /> : <RegisterClosed />}
      </div>
    </main>
  );
}