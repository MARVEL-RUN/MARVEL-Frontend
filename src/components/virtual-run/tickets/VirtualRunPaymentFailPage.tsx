"use client";

import { useSearchParams } from "next/navigation";
import { VrLink } from "@/components/virtual-run/layout/VrLink";
import { VirtualRunSubPage } from "@/components/virtual-run/layout/VirtualRunSubPage";
import { readVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import { useEffect, useState } from "react";

export function VirtualRunPaymentFailPage() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const message = params.get("message") ?? "결제가 취소되었거나 실패했습니다.";
  const orderId = params.get("orderId") ?? "";
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    setHasPending(Boolean(readVirtualRunTicketPending()));
  }, []);

  return (
    <VirtualRunSubPage kicker="PAY" title="결제" en="CHECKOUT">
      <div className="page__body wrap">
        <section className="ticket ticket--status">
          <p className="kicker">PAYMENT FAILED</p>
          <h2>결제 실패</h2>
          <p className="form__err">{message}</p>
          {code ? <p className="form__note">코드: {code}</p> : null}
          {orderId ? (
            <div className="ticket__order">
              <span className="ticket__order-label">주문번호</span>
              <code className="ticket__order-id">{orderId}</code>
            </div>
          ) : null}
          <div className="flow__nav">
            <VrLink
              href={hasPending ? "/payment" : "/tickets"}
              className="btn btn--red"
            >
              {hasPending ? "다시 결제" : "티켓 구매"}
            </VrLink>
            <VrLink href="/" className="btn btn--ghost">
              홈으로
            </VrLink>
          </div>
        </section>
      </div>
    </VirtualRunSubPage>
  );
}
