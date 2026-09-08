import { EVENT } from "@/lib/event";
import { Backdrop } from "./Backdrop";
import { HeroCharacters } from "./HeroCharacters";
import { TitleBlock } from "./TitleBlock";
import { EventInfo } from "./EventInfo";
import { Sponsors } from "./Sponsors";

export function ComingSoonPage() {
  return (
    <main className="coming-soon">
      <div className="stage">
        <HeroCharacters />
        <span aria-hidden className="veil" />
        <Backdrop />

        <p className="copyright">{EVENT.copyright}</p>

        <div className="shell">
          <TitleBlock />
          <EventInfo />
          <Sponsors />
        </div>
      </div>
    </main>
  );
}
