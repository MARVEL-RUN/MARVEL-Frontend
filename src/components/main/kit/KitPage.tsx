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
        <div className="kit-page__sponsor-more">
          <p className="kit-page__sponsor-more-notices">
            {EVENT.sponsorMoreNotice}
          </p>
          <p className="kit-page__sponsor-more-label">{EVENT.sponsorMore}</p>
          <p className="kit-page__sponsor-more-note">{EVENT.sponsorMoreNote}</p>
          <span className="kit-page__sponsor-more-line" aria-hidden="true" />
        </div>
        <RegisterCta className="btn btn--red" />
      </div>
    </main>
  );
}
