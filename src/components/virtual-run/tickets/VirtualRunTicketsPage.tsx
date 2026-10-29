import { VIRTUAL_RUN_EVENT } from "@/lib/virtual-run/event";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunTicketsPage() {
  return (
    <VirtualRunSubPage kicker="TICKET" title="티켓 구매" en="GET YOUR PASS">
      <section className="guide-sec">
        <div className="wrap wrap--narrow">
          <p className="page__body vr-page-lead">
            회차를 선택한 뒤 결제 페이지로 이동합니다.
          </p>
          <form className="vr-ticket-options">
            <label className="vr-ticket-option">
              <input type="radio" name="ticket" value="single" defaultChecked />
              <div>
                <strong>1회차</strong>
                <p className="vr-form-note">{VIRTUAL_RUN_EVENT.ticketSingle}</p>
              </div>
            </label>
            <label className="vr-ticket-option">
              <input type="radio" name="ticket" value="package" />
              <div>
                <strong>3회차 PKG</strong>
                <p className="vr-form-note">{VIRTUAL_RUN_EVENT.ticketPackage}</p>
              </div>
            </label>
          </form>
          <p className="vr-form-note vr-stack-sm">결제·재고 연동은 추후 API와 연결됩니다.</p>
          <VrLink href="/login" className="btn btn--red vr-stack-sm">
            로그인 후 구매
          </VrLink>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
