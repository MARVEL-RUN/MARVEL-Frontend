const STORAGE_KEY = "marvelrun_payment_pending";

export type PaymentOrder = {
  orderId: string;
  orderName: string;
  paymentAmount: number;
};

export type PendingPayment = {
  registration: PaymentOrder;
  customerName: string;
  savedAt: number;
};

export function paymentOrderFromRetry(data: {
  orderId?: string;
  orderName?: string;
  amount?: number;
  paymentAmount?: number;
}): PaymentOrder {
  const orderId = data.orderId?.trim() ?? "";
  const paymentAmount = Number(data.amount ?? data.paymentAmount);
  if (!orderId) throw new Error("결제 주문번호가 없습니다.");
  if (!Number.isFinite(paymentAmount)) throw new Error("결제금액이 없습니다.");
  return {
    orderId,
    orderName: data.orderName?.trim() || "MarvelRun 참가신청",
    paymentAmount,
  };
}

export function savePendingPayment(data: PendingPayment) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  sessionStorage.removeItem(STORAGE_KEY);
}
