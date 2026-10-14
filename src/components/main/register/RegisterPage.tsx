import { SideBanner } from "../layout/SideBanner";
import { MediaLoader } from "../MediaLoader";
import { RegisterFlow } from "./RegisterFlow";

export function RegisterPage() {
  return (
    <MediaLoader>
      <main className="page">
        <SideBanner kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
        <div className="page__body wrap">
          <RegisterFlow />
        </div>
      </main>
    </MediaLoader>
  );
}
