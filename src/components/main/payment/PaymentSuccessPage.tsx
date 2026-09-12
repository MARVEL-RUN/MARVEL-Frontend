"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SideBanner } from "@/components/main/layout/SideBanner";
import { MAIN_ASSETS } from "@/lib/assets";
import { formatFee } from "@/lib/register";
import { clearPendingPayment, readPendingPayment } from "@/lib/payment/session";
import { confirmPayment } from "@/services/main/payments";
import type { PaymentConfirmResponse } from "@/services/main/types";

type Phase = "loading" | "done" | "error";

export function PaymentSuccessPage() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PaymentConfirmResponse | null>(null);
  const [orderName, setOrderName] = useState("");

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amountRaw = params.get("amount");
    const amount = Number(amountRaw);

    if (!paymentKey || !orderId || !amountRaw || !Number.isFinite(amount)) {
      setPhase("error");
      setError("결제 인증 정보가 올바르지 않습니다.");
      return;
    }

    const pending = readPendingPayment();
    if (pending?.registration.orderName) {
      setOrderName(pending.registration.orderName);
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await confirmPayment({ paymentKey, orderId, amount });
        if (cancelled) return;
        clearPendingPayment();
        setResult(data);
        setPhase("done");
      } catch (err) {
        if (cancelled) return;
        setPhase("error");
        setError(
          err instanceof Error ? err.message : "결제 승인에 실패했습니다.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const paid =
    typeof result?.paidAmount === "number"
      ? result.paidAmount
      : Number(params.get("amount")) || 0;
  const orderId =
    (typeof result?.orderId === "string" && result.orderId) ||
    params.get("orderId") ||
    "";
  const receiptUrl =
    typeof result?.receiptUrl === "string" ? result.receiptUrl : "";

  return (
    <main className="page">
      <SideBanner kicker="PAYMENT" title="결제" en="CHECKOUT" />
      <div className="page__body wrap">
        {phase === "loading" ? (
          <section className="ticket ticket--wait" aria-busy="true" aria-live="polite">
            <p className="kicker">PAYMENT</p>
            <div className="ticket__loader" aria-hidden>
              <span className="ticket__loader-ring" />
              <img
                className="ticket__loader-mark"
                src={MAIN_ASSETS.loadingLogo}
                alt=""
                width={88}
                height={88}
              />
            </div>
            <h2>결제 진행 중...</h2>
            <p className="ticket__meta">결제 승인을 확인하고 있습니다.</p>
            <p className="form__note">창을 닫지 말고 잠시만 기다려 주세요.</p>
          </section>
        ) : null}

        {phase === "done" ? (
          <section className="ticket">
            <p className="kicker">PAYMENT COMPLETE</p>
            <h2>결제가 완료되었습니다</h2>
            <p className="ticket__no">{orderId}</p>
            <p className="ticket__meta">
              {orderName ||
                (typeof result?.orderName === "string" ? result.orderName : "")}
              {paid ? ` · ${formatFee(paid)}` : ""}
            </p>
            <p className="form__note">주문번호로 신청조회에서 확인할 수 있습니다.</p>
            <div className="flow__nav">
              {receiptUrl ? (
                <a
                  href={receiptUrl}
                  className="btn btn--ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  영수증
                </a>
              ) : null}
              <Link href="/lookup" className="btn btn--ghost">
                신청조회
              </Link>
              <Link href="/" className="btn btn--red">
                홈으로
              </Link>
            </div>
          </section>
        ) : null}

        {phase === "error" ? (
          <section className="ticket ticket--status">
            <p className="kicker">PAYMENT FAILED</p>
            <h2>결제 승인 실패</h2>
            <p className="form__err">{error}</p>
            <p className="form__note">
              이미 승인됐을 수 있습니다. 신청조회로 확인하거나 다시 시도해 주세요.
            </p>
            <div className="flow__nav">
              <Link href="/lookup" className="btn btn--ghost">
                신청조회
              </Link>
              <Link href="/register" className="btn btn--red">
                신청으로
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
