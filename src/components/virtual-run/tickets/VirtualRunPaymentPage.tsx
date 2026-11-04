"use client";

import { useEffect, useState } from "react";
import { PaymentWidget } from "@/components/main/payment/PaymentWidget";
import { useVrPath, VrLink } from "@/components/virtual-run/layout/VrLink";
import { VirtualRunSubPage } from "@/components/virtual-run/layout/VirtualRunSubPage";
import {
  readVirtualRunTicketPending,
  type VirtualRunTicketPending,
} from "@/lib/virtual-run/ticket-payment";

export function VirtualRunPaymentPage() {
  const toHref = useVrPath();
  const [pending, setPending] = useState<VirtualRunTicketPending | null | undefined>(
    undefined,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setPending(readVirtualRunTicketPending());
  }, []);

  return (
    <VirtualRunSubPage kicker="PAY" title="결제" en="CHECKOUT">
      <div className="page__body wrap">
        <div className="flow">
          {pending === undefined ? (
            <p className="sec__body">결제 정보를 확인하는 중...</p>
          ) : pending ? (
            <>
              {error ? (
                <p className="form__err" role="alert">
                  {error}
                </p>
              ) : null}
              <PaymentWidget
                registration={pending.registration}
                customerName={pending.customerName}
                successPath={toHref("/payment/success")}
                failPath={toHref("/payment/fail")}
                onError={setError}
              />
            </>
          ) : (
            <section className="ticket ticket--status">
              <p className="kicker">NO ORDER</p>
              <h2>결제할 티켓이 없습니다</h2>
              <p className="sec__body">티켓을 먼저 선택해 주세요.</p>
              <div className="flow__nav">
                <VrLink href="/tickets" className="btn btn--red">
                  티켓 구매
                </VrLink>
              </div>
            </section>
          )}
        </div>
      </div>
    </VirtualRunSubPage>
  );
}
