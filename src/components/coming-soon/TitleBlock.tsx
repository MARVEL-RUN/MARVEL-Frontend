import Image from "next/image";
import { EVENT } from "@/lib/event";
import { COMING_SOON_ASSETS } from "@/lib/assets";

export function TitleBlock() {
  return (
    <div className="title">
      <Image
        src={COMING_SOON_ASSETS.logo}
        alt={EVENT.title}
        width={1057}
        height={514}
        priority
        className="title__logo"
      />

      <div className="title__notice">
        <p className="title__date">
          <span>{EVENT.openNoticeDate}</span>
          <span>
            {EVENT.openNoticeTime} <strong>{EVENT.openNoticeAction}</strong>
          </span>
        </p>
        <p className="title__soon">COMING SOON</p>
      </div>
    </div>
  );
}
