"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SideBanner } from "@/components/main/layout/SideBanner";

export function PaymentFailPage() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const message = params.get("message") ?? "결제가 취소되었거나 실패했습니다.";
  const orderId = params.get("orderId") ?? "";

  return (
    <main className="page">
      <SideBanner kicker="PAYMENT" title="결제" en="CHECKOUT" />
      <div className="page__body wrap">
        <section className="block">
          <h2>결제 실패</h2>
          <p className="form__err">{message}</p>
          {code ? <p className="form__note">코드: {code}</p> : null}
          {orderId ? <p className="form__note">주문번호: {orderId}</p> : null}
          <div className="flow__nav">
            <Link href="/register" className="btn btn--red">
              다시 신청
            </Link>
            <Link href="/" className="btn btn--ghost">
              홈으로
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
