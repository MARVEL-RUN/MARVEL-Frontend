import type { RegistrationCreateResponse } from "@/services/main/types";

const STORAGE_KEY = "marvelrun_payment_pending";

export type PendingPayment = {
  registration: RegistrationCreateResponse;
  customerName: string;
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
