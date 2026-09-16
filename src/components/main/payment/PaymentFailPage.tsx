"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SideBanner } from "@/components/main/layout/SideBanner";
import { readPendingPayment } from "@/lib/payment/session";
import { useRegistrationOpen } from "@/components/main/register/useRegistrationOpen";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";

export function PaymentFailPage() {
  const registrationOpen = useRegistrationOpen();
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const message = params.get("message") ?? "결제가 취소되었거나 실패했습니다.";
  const orderId = params.get("orderId") ?? "";
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    setHasPending(Boolean(readPendingPayment()));
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="PAYMENT" title="결제" en="CHECKOUT" />
      <div className="page__body wrap">
        {!registrationOpen ? (
          <RegisterClosed body="접수가 아직 열리지 않아 결제할 신청이 없습니다." />
        ) : (
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
            <Link
              href={hasPending ? "/payment" : "/register"}
              className="btn btn--red"
            >
              {hasPending ? "다시 결제" : "다시 신청"}
            </Link>
            <Link href="/lookup" className="btn btn--ghost">
              신청조회
            </Link>
            <Link href="/" className="btn btn--ghost">
              홈으로
            </Link>
          </div>
        </section>
        )}
      </div>
    </main>
  );
}
