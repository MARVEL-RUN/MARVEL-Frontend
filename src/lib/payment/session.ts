const STORAGE_KEY = "marvelrun_payment_pending";

export type PaymentOrder = {
  orderId: string;
  orderName: string;
  paymentAmount: number;
};

export type PaymentReceiptItem = {
  name: string;
  detail: string;
  amount: number;
};

export type PaymentReceipt = {
  kind: "group" | "individual";
  title: string;
  subtitle?: string;
  items: PaymentReceiptItem[];
};

export type PendingPayment = {
  registration: PaymentOrder;
  customerName: string;
  receipt?: PaymentReceipt;
  savedAt: number;
};

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
