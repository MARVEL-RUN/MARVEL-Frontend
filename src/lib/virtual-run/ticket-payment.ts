import type { PaymentOrder } from "@/lib/payment/session";
import type { VirtualRunRoundId } from "@/lib/virtual-run/rounds";

const STORAGE_KEY = "marvel-run:vr-ticket-pending";

export type VirtualRunTicketKind = "single" | "package" | "mixed";

export type VirtualRunTicketPending = {
  registration: PaymentOrder;
  customerName: string;
  phone: string;
  kind: VirtualRunTicketKind;
  roundIds: VirtualRunRoundId[];
  savedAt: number;
};

/** Toss orderId: 6~64자, 영문·숫자·`-` `_` */
export function createVirtualRunOrderId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `vr_${Date.now()}_${rand}`;
}

export function saveVirtualRunTicketPending(data: VirtualRunTicketPending) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readVirtualRunTicketPending(): VirtualRunTicketPending | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VirtualRunTicketPending;
  } catch {
    return null;
  }
}

export function clearVirtualRunTicketPending() {
  sessionStorage.removeItem(STORAGE_KEY);
}
