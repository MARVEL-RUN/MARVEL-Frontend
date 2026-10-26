import Link from "next/link";
import { EVENT } from "@/lib/event";
import { registrationClosedKind } from "@/lib/register-schedule";

export function RegisterClosed({
  body,
}: {
  body?: string;
}) {
  const ended = registrationClosedKind() === "ended";
  const copy = body ?? (ended
    ? "추가 접수 기간이 종료되었습니다. 접수 내역은 신청조회에서 확인해 주세요."
    : "접수는 아직 열리지 않았습니다. 오픈 시각에 이 페이지에서 개인 또는 단체 신청을 할 수 있습니다.");

  return (
    <section className="block wait">
      <p className="kicker">{ended ? "CLOSED" : "STANDBY"}</p>
      <h2>
        {ended ? (
          <>
            참가 신청이 마감되었습니다
            <br />
            {EVENT.closeNoticeDate} · {EVENT.closeNoticeTime}
          </>
        ) : (
          <>
            {EVENT.openNoticeDate}
            <br />
            {EVENT.openNoticeTime} {EVENT.openNoticeAction}
          </>
        )}
      </h2>
      <p className="sec__body">{copy}</p>
      <div className="flow__nav">
        <Link href="/guide" className="btn btn--ghost">
          대회안내
        </Link>
        {ended ? (
          <Link href="/lookup" className="btn btn--red">
            신청조회
          </Link>
        ) : (
          <Link href="/notices" className="btn btn--red">
            공지사항
          </Link>
        )}
      </div>
    </section>
  );
}
