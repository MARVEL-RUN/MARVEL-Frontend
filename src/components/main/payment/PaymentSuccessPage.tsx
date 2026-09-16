"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { SideBanner } from "@/components/main/layout/SideBanner";
import { MAIN_ASSETS } from "@/lib/assets";
import { registerUiOpen } from "@/lib/mode";
import { formatFee } from "@/lib/register";
import { clearPendingPayment, readPendingPayment } from "@/lib/payment/session";
import { confirmPayment } from "@/services/main/payments";
import type { PaymentConfirmResponse } from "@/services/main/types";
import { SheetModal } from "@/components/main/SheetModal";
import { isMobileView } from "@/lib/viewport";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickReceiptUrl(data: PaymentConfirmResponse | null) {
  const root = asRecord(data);
  if (!root) return "";
  const payload = asRecord(root.data) ?? root;
  const direct = payload.receiptUrl;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const receipt = payload.receipt;
  if (typeof receipt === "string" && receipt.trim()) return receipt.trim();
  const nested = asRecord(receipt);
  if (nested && typeof nested.url === "string" && nested.url.trim()) {
    return nested.url.trim();
  }
  return "";
}

type Phase = "loading" | "done" | "error";

function authFromParams(params: { get: (key: string) => string | null }) {
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amountRaw = params.get("amount");
  const amount = Number(amountRaw);
  if (!paymentKey || !orderId || !amountRaw || !Number.isFinite(amount)) {
    return null;
  }
  return { paymentKey, orderId, amount };
}

export function PaymentSuccessPage() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>(() =>
    authFromParams(params) ? "loading" : "error",
  );
  const [error, setError] = useState(() =>
    authFromParams(params) ? "" : "결제 인증 정보가 올바르지 않습니다.",
  );
  const [result, setResult] = useState<PaymentConfirmResponse | null>(null);
  const [orderName, setOrderName] = useState("");
  const [copied, setCopied] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    const auth = authFromParams(params);
    if (!auth) {
      setPhase("error");
      setError("결제 인증 정보가 올바르지 않습니다.");
      return;
    }

    const pending = readPendingPayment();
    setCanRetry(Boolean(pending));
    if (pending?.registration.orderName) {
      setOrderName(pending.registration.orderName);
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await confirmPayment(auth);
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
      : typeof result?.amount === "number"
        ? result.amount
        : Number(params.get("amount")) || 0;
  const orderId =
    (typeof result?.orderId === "string" && result.orderId) ||
    params.get("orderId") ||
    "";
  const receiptUrl = pickReceiptUrl(result);
  const title =
    orderName ||
    (typeof result?.orderName === "string" ? result.orderName : "");

  async function copyOrderId() {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="page">
      <SideBanner kicker="PAYMENT" title="결제" en="CHECKOUT" />
      <div className="page__body wrap">
        {!registerUiOpen ? (
          <RegisterClosed body="접수가 아직 열리지 않아 결제할 신청이 없습니다." />
        ) : (
        <>
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
          <section className="ticket ticket--done">
            <p className="kicker">PAYMENT COMPLETE</p>
            <h2>결제가 완료되었습니다</h2>
            <p className="ticket__summary">
              {title}
              {paid ? <span>{formatFee(paid)}</span> : null}
            </p>
            {orderId ? (
              <div className="ticket__order">
                <span className="ticket__order-label">주문번호</span>
                <code className="ticket__order-id">{orderId}</code>
                <button
                  type="button"
                  className="ticket__order-copy"
                  onClick={copyOrderId}
                  aria-label="주문번호 복사"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
            ) : null}
            {receiptUrl ? (
              <p className="form__note">
                영수증은 토스 매출전표입니다. 전표 위 인쇄 아이콘을 누른 뒤 PDF로
                저장하세요.
              </p>
            ) : null}
            <div className="flow__nav">
              {receiptUrl ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    if (isMobileView()) {
                      window.location.assign(receiptUrl);
                      return;
                    }
                    setReceiptOpen(true);
                  }}
                >
                  영수증
                </button>
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

        {receiptOpen && receiptUrl ? (
          <SheetModal
            kicker="RECEIPT"
            title="영수증"
            tall
            side="left"
            onClose={() => setReceiptOpen(false)}
          >
            <div className="sheet-modal__receipt">
              <p className="sheet-modal__hint">
                전표 위 인쇄 아이콘을 누른 뒤 PDF로 저장할 수 있습니다.
              </p>
              <iframe
                className="sheet-modal__frame"
                src={receiptUrl}
                title="결제 영수증"
              />
            </div>
          </SheetModal>
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
              <Link
                href={canRetry ? "/payment" : "/register"}
                className="btn btn--red"
              >
                {canRetry ? "다시 결제" : "다시 신청"}
              </Link>
              <Link href="/lookup" className="btn btn--ghost">
                신청조회
              </Link>
              <Link href="/" className="btn btn--ghost">
                홈으로
              </Link>
            </div>
          </section>
        ) : null}
        </>
        )}
      </div>
    </main>
  );
}
