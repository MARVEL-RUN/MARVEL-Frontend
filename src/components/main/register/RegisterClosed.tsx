import { EVENT } from "@/lib/event";

export function RegisterClosed() {
  return (
    <section className="block wait">
      <p className="kicker">STANDBY</p>
      <h2>
        {EVENT.openNoticeDate}
        <br />
        {EVENT.openNoticeTime} {EVENT.openNoticeAction}
      </h2>
      <p className="sec__body">
        접수는 아직 열리지 않았습니다. 오픈 시각에 이 페이지에서 개인 또는 단체
        신청을 할 수 있습니다.
      </p>
    </section>
  );
}