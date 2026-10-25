import { SideBanner } from "../layout/SideBanner";
import { MediaLoader } from "../MediaLoader";
import { SponsorsBrandsRows } from "./SponsorsBrandsRows";

export function BrandsPage() {
  return (
    <MediaLoader>
      <main className="page">
        <SideBanner
          kicker="BRANDS"
          title="마블런과 함께하는 브랜드"
          en="PARTNER BRANDS"
        />
        <section className="sponsors sponsors--page" aria-label="브랜드 목록">
          <div className="sponsors__inner">
            <SponsorsBrandsRows />
          </div>
        </section>
      </main>
    </MediaLoader>
  );
}
