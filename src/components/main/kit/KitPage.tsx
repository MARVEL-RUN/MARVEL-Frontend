import { EVENT } from "@/lib/event";
import { RegisterCta } from "../register/RegisterCta";
import { SideBanner } from "../layout/SideBanner";
import { KitGallery } from "./KitGallery";

export function KitPage() {
  return (
    <main className="page">
      <SideBanner kicker="KIT" title="기념품 안내" en="RACE KIT" />
      <div className="page__body wrap kit-page">
        <KitGallery />
        <p className="kit-page__sponsor-more">
          <span className="kit-page__sponsor-more-label">
            {EVENT.sponsorMore}
          </span>
          <span className="kit-page__sponsor-more-note">
            {EVENT.sponsorMoreNote}
          </span>
          <span className="kit-page__sponsor-more-line" aria-hidden="true" />
        </p>
        <RegisterCta className="btn btn--red" />
      </div>
    </main>
  );
}
