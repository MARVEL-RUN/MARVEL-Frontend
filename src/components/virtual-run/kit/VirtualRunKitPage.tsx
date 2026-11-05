import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VirtualRunTicketsCta } from "../layout/VirtualRunTicketsCta";
import { VirtualRunKitGallery } from "./VirtualRunKitGallery";
import { VirtualRunKitVideoLoader } from "./VirtualRunKitVideoLoader";
import "./kit.css";

export function VirtualRunKitPage() {
  return (
    <VirtualRunKitVideoLoader>
      <VirtualRunSubPage kicker="KIT" title="기념품" en="RACE KIT">
        <section className="guide-sec">
          <div className="wrap vr-kit-page vr-page-inner">
            <p className="vr-page-lead">
              회차별 테마 키트 구성입니다. 실물은 행사 안내 및 마이페이지에서 배송 상태를 확인할
              수 있습니다.
            </p>
            <VirtualRunKitGallery />
            <div className="vr-kit-page__cta">
              <VirtualRunTicketsCta />
            </div>
          </div>
        </section>
      </VirtualRunSubPage>
    </VirtualRunKitVideoLoader>
  );
}
