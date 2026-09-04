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
        <Backdrop />

        <div className="shell">
          <HeroCharacters />
          <TitleBlock />
          <EventInfo />
          <Sponsors />
          <p className="copyright">{EVENT.copyright}</p>
        </div>
      </div>
    </main>
  );
}
