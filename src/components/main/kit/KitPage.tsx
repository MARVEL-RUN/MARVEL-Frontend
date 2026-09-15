import Link from "next/link";
import { EVENT } from "@/lib/event";
import { REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import { SideBanner } from "../layout/SideBanner";
import { KitApplyNote, KitGallery } from "./KitGallery";

export function KitPage() {
  return (
    <main className="page">
      <SideBanner kicker="KIT" title="기념품 안내" en="RACE KIT" />
      <div className="page__body wrap kit-page">
        <KitGallery />
        <KitApplyNote className="kit-gallery__note" />
        <ul className="chips">
          {EVENT.kit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href={REGISTER_HREF} className="btn btn--red">
          {registerUiOpen ? "참가신청" : "접수 안내"}
        </Link>
        <p className="kit-page__sponsor-more">{EVENT.sponsorMore}</p>
      </div>
    </main>
  );
}
