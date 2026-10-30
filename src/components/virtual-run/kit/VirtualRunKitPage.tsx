import { MediaLoader } from "../../main/MediaLoader";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { VirtualRunKitGallery } from "./VirtualRunKitGallery";
import "./kit.css";

export function VirtualRunKitPage() {
  return (
    <MediaLoader>
      <VirtualRunSubPage kicker="KIT" title="기념품" en="RACE KIT">
        <section className="guide-sec">
          <div className="wrap vr-kit-page vr-page-inner">
            <p className="vr-page-lead">
              회차별 테마 키트 구성입니다. 실물은 행사 안내 및 마이페이지에서 배송 상태를 확인할
              수 있습니다.
            </p>
            <VirtualRunKitGallery />
            <VrLink href="/tickets" className="btn btn--red">
              티켓 구매
            </VrLink>
          </div>
        </section>
      </VirtualRunSubPage>
    </MediaLoader>
  );
}
