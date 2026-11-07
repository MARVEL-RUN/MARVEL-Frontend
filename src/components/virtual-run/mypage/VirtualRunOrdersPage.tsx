"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mainToast } from "@/components/main/feedback/MainFeedback";
import { formatFee } from "@/lib/register";
import { MainHttpError } from "@/lib/main/fetch";
import { readLoginSession, writeLoginSession } from "@/lib/virtual-run/login-session";
import { syncVirtualRunSessionFromLookup } from "@/lib/virtual-run/sync-session";
import { saveVirtualRunTicketPending } from "@/lib/virtual-run/ticket-payment";
import {
  cancelParticipantItem,
  cancelParticipantOrder,
  fetchParticipantOrders,
  retryParticipantPayment,
} from "@/services/main/participant-auth";
import {
  orderProductLabel,
  type ParticipantOrder,
  type ParticipantOrderItem,
} from "@/services/main/participant-orders";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { useVrPath, VrLink } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "접수",
  PAYMENT_PENDING: "결제 대기",
  CONFIRMED: "결제 완료",
  ADDITIONAL_PAYMENT_REQUIRED: "추가 결제",
  PARTIAL_REFUND_REQUIRED: "부분 환불",
  CANCELLATION_PENDING: "취소 처리 중",
  CANCELED: "취소",
  EXPIRED: "만료",
};

function errorMessage(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.trim();
  if (!message || message.length > 180) return fallback;
  if (err instanceof MainHttpError && err.status >= 500) return fallback;
  return message;
}

function whenLabel(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(order: ParticipantOrder) {
  if (order.canceled) return "취소";
  return STATUS_LABEL[order.registrationStatus] || order.registrationStatus || "주문";
}

export function VirtualRunOrdersPage() {
  const router = useRouter();
  const toHref = useVrPath();
  const { update } = useVirtualRunParticipant();
  const [orders, setOrders] = useState<ParticipantOrder[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [confirmItemId, setConfirmItemId] = useState("");

  useEffect(() => {
    const session = readLoginSession();
    if (!session?.tokens?.accessToken) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    fetchParticipantOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "주문 목록을 불러오지 못했습니다."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function choose(order: ParticipantOrder) {
    const session = readLoginSession();
    if (!session || busyId) return;
    setBusyId(order.registrationId);
    setError("");
    try {
      writeLoginSession({ ...session, registrationId: order.registrationId });
      const synced = await syncVirtualRunSessionFromLookup();
      if (synced?.participant) update(synced.participant);
      router.push(toHref("/mypage"));
    } catch (err) {
      setError(errorMessage(err, "주문을 열지 못했습니다."));
      setBusyId("");
    }
  }

  async function cancel(order: ParticipantOrder) {
    if (busyId) return;
    setBusyId(order.registrationId);
    setError("");
    try {
      const result = await cancelParticipantOrder(order.registrationId);
      const refund =
        result.refundCount > 0 ? ` 환불 ${formatFee(result.refundAmount)}.` : "";
      mainToast.success(`주문을 취소했습니다.${refund}`);
      setConfirmId("");
      setOrders(await fetchParticipantOrders());
    } catch (err) {
      setError(errorMessage(err, "주문을 취소하지 못했습니다."));
    } finally {
      setBusyId("");
    }
  }

  async function cancelItem(order: ParticipantOrder, item: ParticipantOrderItem) {
    if (busyId) return;
    setBusyId(item.itemId);
    setError("");
    try {
      const result = await cancelParticipantItem(order.registrationId, item.itemId);
      const refund =
        result.refundCount > 0 ? ` 환불 ${formatFee(result.refundAmount)}.` : "";
      const living = order.items.filter((row) => !row.canceledAt).length;
      mainToast.success(
        living <= 1
          ? `마지막 상품이라 주문 전체를 취소했습니다.${refund}`
          : `상품을 취소했습니다.${refund}`,
      );
      setConfirmItemId("");
      setOrders(await fetchParticipantOrders());
    } catch (err) {
      setError(errorMessage(err, "상품을 취소하지 못했습니다."));
    } finally {
      setBusyId("");
    }
  }

  async function retry(order: ParticipantOrder) {
    const session = readLoginSession();
    if (!session || busyId || !order.paymentId) return;
    setBusyId(order.registrationId);
    setError("");
    try {
      const paid = await retryParticipantPayment(order.registrationId, order.paymentId);
      saveVirtualRunTicketPending({
        registration: {
          orderId: paid.orderId,
          orderName: paid.orderName || orderProductLabel(order),
          paymentAmount: paid.amount,
        },
        customerName: session.access.name,
        phone: session.access.phNum,
        kind: order.items.some((item) => item.productType === "PACKAGE") ? "package" : "single",
        roundIds: [],
        savedAt: Date.now(),
      });
      router.push(toHref("/payment"));
    } catch (err) {
      setError(errorMessage(err, "결제를 다시 열지 못했습니다."));
      setBusyId("");
    }
  }

  const loading = orders === null && !error;

  return (
    <VirtualRunSubPage kicker="ORDERS" title="내 주문" en="ORDERS">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          {loading ? <p className="form__note">주문을 불러오는 중...</p> : null}
          {error ? (
            <p className="form__err" role="alert">
              {error}
            </p>
          ) : null}
          {orders && orders.length === 0 && !error ? (
            <section className="block wait">
              <h2>주문이 없습니다</h2>
              <div className="flow__nav">
                <VrLink href="/tickets" className="btn btn--red">
                  티켓 구매
                </VrLink>
              </div>
            </section>
          ) : null}
          <div className="vr-orders">
            {orders?.map((order) => {
              const label = orderProductLabel(order) || "주문";
              const modifyUntil = whenLabel(order.modificationDeadline);
              const refundUntil = whenLabel(order.refundDeadline);
              const canRetry =
                !order.canceled &&
                order.paymentAction === "PREPARE_PAYMENT" &&
                Boolean(order.paymentId);
              const canCancel = !order.canceled && order.refundAllowed;
              const confirming = confirmId === order.registrationId;
              const livingItems = order.items.filter((item) => !item.canceledAt);
              return (
                <article key={order.registrationId} className="block vr-order">
                  <header className="vr-order__head">
                    <h2>{label}</h2>
                    <span className={order.canceled ? "vr-order__badge is-off" : "vr-order__badge"}>
                      {statusLabel(order)}
                    </span>
                  </header>
                  <p className="vr-order__meta">
                    {formatFee(order.totalAmount)}
                    {order.paidAmount ? ` · 결제 ${formatFee(order.paidAmount)}` : ""}
                  </p>
                  {modifyUntil || refundUntil ? (
                    <p className="form__note">
                      {modifyUntil ? `수정 마감 ${modifyUntil}` : ""}
                      {modifyUntil && refundUntil ? " · " : ""}
                      {refundUntil ? `환불 마감 ${refundUntil}` : ""}
                    </p>
                  ) : null}
                  {order.canceled ? (
                    <p className="form__note">취소한 주문은 수정·환불·재결제를 할 수 없습니다.</p>
                  ) : null}
                  {order.items.length ? (
                    <ul className="vr-order__items">
                      {order.items.map((item) => {
                        const canceled = Boolean(item.canceledAt);
                        const itemKey = `${order.registrationId}:${item.itemId}`;
                        const confirmingItem = confirmItemId === itemKey;
                        const lastLiving = !canceled && livingItems.length <= 1;
                        return (
                          <li key={item.itemId} className={canceled ? "is-off" : undefined}>
                            <div>
                              <strong>{item.eventCategoryName || "상품"}</strong>
                              <span>
                                {formatFee(item.amount)}
                                {canceled ? ` · 취소 ${whenLabel(item.canceledAt)}` : ""}
                              </span>
                            </div>
                            {canCancel && !canceled && !confirmingItem ? (
                              <button
                                type="button"
                                className="btn btn--ghost"
                                disabled={Boolean(busyId)}
                                onClick={() => {
                                  setConfirmId("");
                                  setConfirmItemId(itemKey);
                                }}
                              >
                                이 상품 취소
                              </button>
                            ) : null}
                            {confirmingItem ? (
                              <div className="vr-order__confirm">
                                <p>
                                  {lastLiving
                                    ? "남은 마지막 상품이라 주문 전체가 취소됩니다."
                                    : "이 상품만 취소하고 그 금액을 환불합니다."}
                                </p>
                                <div className="flow__nav">
                                  <button
                                    type="button"
                                    className="btn btn--red"
                                    disabled={Boolean(busyId)}
                                    onClick={() => void cancelItem(order, item)}
                                  >
                                    취소하기
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--ghost"
                                    disabled={Boolean(busyId)}
                                    onClick={() => setConfirmItemId("")}
                                  >
                                    닫기
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  <div className="flow__nav">
                    <button
                      type="button"
                      className="btn btn--red"
                      disabled={Boolean(busyId)}
                      onClick={() => void choose(order)}
                    >
                      이 주문 보기
                    </button>
                    {canRetry ? (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        disabled={Boolean(busyId)}
                        onClick={() => void retry(order)}
                      >
                        결제 다시
                      </button>
                    ) : null}
                    {canCancel && !confirming ? (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        disabled={Boolean(busyId)}
                        onClick={() => {
                          setConfirmItemId("");
                          setConfirmId(order.registrationId);
                        }}
                      >
                        주문 취소
                      </button>
                    ) : null}
                  </div>
                  {confirming ? (
                    <div className="vr-order__confirm">
                      <p>이 주문 전체를 취소합니다. 환불 가능 기간과 결제 상태를 확인한 뒤 진행합니다.</p>
                      <div className="flow__nav">
                        <button
                          type="button"
                          className="btn btn--red"
                          disabled={Boolean(busyId)}
                          onClick={() => void cancel(order)}
                        >
                          취소하기
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={Boolean(busyId)}
                          onClick={() => setConfirmId("")}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          {orders && orders.length > 0 ? (
            <div className="flow__nav">
              <VrLink href="/tickets" className="btn btn--ghost">
                추가 주문
              </VrLink>
              <VrLink href="/mypage" className="btn btn--ghost">
                마이페이지
              </VrLink>
            </div>
          ) : null}
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
