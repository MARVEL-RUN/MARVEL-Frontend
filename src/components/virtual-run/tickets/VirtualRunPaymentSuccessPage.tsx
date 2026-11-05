"use client";

import { Check, Copy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SheetModal } from "@/components/main/SheetModal";
import { VrLink } from "@/components/virtual-run/layout/VrLink";
import { VirtualRunSubPage } from "@/components/virtual-run/layout/VirtualRunSubPage";
import { MAIN_ASSETS } from "@/lib/assets";
import { hasMainApi } from "@/lib/main/config";
import { pickReceiptUrl } from "@/lib/payment/receipt";
import { formatFee } from "@/lib/register";
import { isMobileView } from "@/lib/viewport";
import {
  clearVirtualRunTicketPending,
  readVirtualRunTicketPending,
} from "@/lib/virtual-run/ticket-payment";
import { syncVirtualRunSessionFromLookup } from "@/lib/virtual-run/sync-session";
import { confirmPayment } from "@/services/main/payments";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import type { PaymentConfirmResponse } from "@/services/main/types";

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

export function VirtualRunPaymentSuccessPage() {
  const params = useSearchParams();
  const { update } = useVirtualRunParticipant();
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
  const [confirmPending, setConfirmPending] = useState(false);

  useEffect(() => {
    const auth = authFromParams(params);
    if (!auth) {
      setPhase("error");
      setError("결제 인증 정보가 올바르지 않습니다.");
      return;
    }

    const pending = readVirtualRunTicketPending();
    setCanRetry(Boolean(pending));
    if (pending?.registration.orderName) {
      setOrderName(pending.registration.orderName);
    }

    let cancelled = false;

    (async () => {
      if (!hasMainApi) {
        if (cancelled) return;
        clearVirtualRunTicketPending();
        setConfirmPending(true);
        setPhase("done");
        return;
      }

      try {
        const data = await confirmPayment(auth);
        if (cancelled) return;
        clearVirtualRunTicketPending();
        const synced = await syncVirtualRunSessionFromLookup().catch(() => null);
        if (synced?.participant) update(synced.participant);
        setResult(data);
        setConfirmPending(false);
        setPhase("done");
      } catch {
        if (cancelled) return;
        // VR 주문 API 전 — 결제창 복귀 UI는 유지, 영수증만 비활성
        clearVirtualRunTicketPending();
        setConfirmPending(true);
        setPhase("done");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, update]);

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
    (typeof result?.orderName === "string" ? result.orderName : "") ||
    "버추얼런 티켓";

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
    <VirtualRunSubPage kicker="PAY" title="결제" en="CHECKOUT">
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
          <section className="ticket ticket--done vr-pay-done">
            <p className="kicker">PAYMENT COMPLETE</p>
            <h2>
              결제가 <em>완료</em>되었습니다
            </h2>
            <p className="vr-pay-done__product">{title}</p>
            {paid ? <p className="vr-pay-done__amount">{formatFee(paid)}</p> : null}
            {orderId ? (
              <div className="ticket__order vr-pay-done__order">
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
            ) : confirmPending ? (
              <p className="form__note">
                서버 승인 연동 전 · 배번호·SMS·영수증은 아직 제공되지 않습니다
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
              <VrLink href="/guide" className="btn btn--ghost">
                인증 가이드
              </VrLink>
              <VrLink href="/mypage" className="btn btn--red">
                마이페이지
              </VrLink>
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
            <p className="kicker">PAYMENT</p>
            <h2>결제 정보가 올바르지 않습니다</h2>
            <p className="form__err">{error}</p>
            <div className="flow__nav">
              <VrLink
                href={canRetry ? "/payment" : "/tickets"}
                className="btn btn--red"
              >
                {canRetry ? "다시 결제" : "티켓 구매"}
              </VrLink>
            </div>
          </section>
        ) : null}
      </div>
    </VirtualRunSubPage>
  );
}
