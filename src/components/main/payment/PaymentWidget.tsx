"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { formatFee } from "@/lib/register";
import { createPaymentWidgets } from "@/lib/payment/toss";
import type { RegistrationCreateResponse } from "@/services/main/types";

type Props = {
  registration: RegistrationCreateResponse;
  customerName: string;
  onError?: (message: string) => void;
};

export function PaymentWidget({ registration, customerName, onError }: Props) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bootError, setBootError] = useState("");
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const uid = useId().replace(/:/g, "");
  const methodId = `toss-pay-method-${uid}`;
  const agreeId = `toss-pay-agree-${uid}`;

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setBootError("");
    widgetsRef.current = null;

    (async () => {
      try {
        const widgets = await createPaymentWidgets();
        if (cancelled) return;

        await widgets.setAmount({
          currency: "KRW",
          value: registration.paymentAmount,
        });
        if (cancelled) return;

        const methodEl = document.getElementById(methodId);
        const agreeEl = document.getElementById(agreeId);
        if (methodEl) methodEl.innerHTML = "";
        if (agreeEl) agreeEl.innerHTML = "";

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: `#${methodId}`,
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: `#${agreeId}`,
            variantKey: "AGREEMENT",
          }),
        ]);
        if (cancelled) return;

        widgetsRef.current = widgets;
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "결제 UI를 불러오지 못했습니다.";
        setBootError(message);
        onErrorRef.current?.(message);
      }
    })();

    return () => {
      cancelled = true;
      widgetsRef.current = null;
    };
  }, [registration.paymentAmount, registration.orderId, methodId, agreeId]);

  async function onPay() {
    const widgets = widgetsRef.current;
    if (!widgets) return;

    setBusy(true);
    try {
      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId: registration.orderId,
        orderName: registration.orderName,
        successUrl: `${origin}/payment/success`,
        failUrl: `${origin}/payment/fail`,
        customerName,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "결제 요청에 실패했습니다.";
      onErrorRef.current?.(message);
      setBusy(false);
    }
  }

  return (
    <section className="block payment-panel">
      <h2>결제하기</h2>
      <p className="sec__body">
        {registration.orderName}
        <br />
        결제금액 <strong>{formatFee(registration.paymentAmount)}</strong>
      </p>
      <p className="form__note">주문번호 {registration.orderId}</p>

      {bootError ? <p className="form__err">{bootError}</p> : null}

      <div id={methodId} className="payment-panel__widget" />
      <div id={agreeId} className="payment-panel__widget" />

      <div className="flow__nav">
        <button
          type="button"
          className="btn btn--red"
          onClick={onPay}
          disabled={!ready || busy || Boolean(bootError)}
        >
          {busy ? "결제창 여는 중..." : ready ? "결제하기" : "결제수단 준비 중..."}
        </button>
      </div>
    </section>
  );
}
