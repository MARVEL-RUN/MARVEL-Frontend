"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readPendingPayment, type PendingPayment } from "@/lib/payment/session";
import { registerUiOpen } from "@/lib/mode";
import { scrollPageTop } from "@/lib/scroll-page";
import { SideBanner } from "../layout/SideBanner";
import { RegisterClosed } from "../register/RegisterClosed";
import { PaymentWidget } from "./PaymentWidget";

export function PaymentPage() {
  const [pending, setPending] = useState<PendingPayment | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setPending(readPendingPayment());
    scrollPageTop();
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="PAY" title="결제" en="CHECKOUT" />
      <div className="page__body wrap">
        {!registerUiOpen ? (
          <RegisterClosed body="접수가 아직 열리지 않아 결제할 신청이 없습니다." />
        ) : (
        <div className="flow">
          {pending === undefined ? (
            <p className="sec__body">결제 정보를 확인하는 중...</p>
          ) : pending ? (
            <PaymentWidget
              registration={pending.registration}
              customerName={pending.customerName}
            />
          ) : (
            <section className="block wait">
              <p className="kicker">NO ORDER</p>
              <h2>결제할 신청이 없습니다</h2>
              <p className="sec__body">참가신청을 먼저 진행해 주세요.</p>
              <Link href="/register" className="btn btn--red">
                참가신청
              </Link>
            </section>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
