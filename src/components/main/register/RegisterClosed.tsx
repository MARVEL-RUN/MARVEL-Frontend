import Link from "next/link";
import { EVENT } from "@/lib/event";

export function RegisterClosed({
  body = "접수는 아직 열리지 않았습니다. 오픈 시각에 이 페이지에서 개인 또는 단체 신청을 할 수 있습니다.",
}: {
  body?: string;
}) {
  return (
    <section className="block wait">
      <p className="kicker">STANDBY</p>
      <h2>
        {EVENT.openNoticeDate}
        <br />
        {EVENT.openNoticeTime} {EVENT.openNoticeAction}
      </h2>
      <p className="sec__body">{body}</p>
      <div className="flow__nav">
        <Link href="/guide" className="btn btn--ghost">
          대회안내
        </Link>
        <Link href="/notices" className="btn btn--red">
          공지사항
        </Link>
      </div>
    </section>
  );
}
