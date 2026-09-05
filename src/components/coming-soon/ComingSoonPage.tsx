import { EVENT } from "@/lib/event";
import { Backdrop } from "./Backdrop";
import { HeroCharacters } from "./HeroCharacters";
import { TitleBlock } from "./TitleBlock";
import { EventInfo } from "./EventInfo";
import { Sponsors } from "./Sponsors";

export function ComingSoonPage() {
  return (
    <main className="page">
      <div className="stage">
        {/* 아래에서 위로: 키비주얼 - 남색 베일 - 무늬 - 무늬 페이드 - 글씨 */}
        <HeroCharacters />
        <span aria-hidden className="veil" />
        <Backdrop />
        <span aria-hidden className="mist" />

        <div className="shell">
          <TitleBlock />
          <EventInfo />
          <Sponsors />
          <p className="copyright">{EVENT.copyright}</p>
        </div>
      </div>
    </main>
  );
}
