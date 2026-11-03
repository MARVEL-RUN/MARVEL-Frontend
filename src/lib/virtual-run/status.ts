import type {
  KitCertStatus,
  KitShippingStatus,
  VirtualRunRewardRow,
} from "./participant";
import type { VirtualRunRoundCertStatus } from "./rounds";

/** `.vr-status--{tone}` */
export type VirtualRunStatusTone = "off" | "wait" | "progress" | "ok" | "err";

export const VIRTUAL_RUN_ROUND_STATUS_TONE: Record<VirtualRunRoundCertStatus, VirtualRunStatusTone> = {
  locked: "off",
  ready: "wait",
  pending: "progress",
  approved: "ok",
  rejected: "err",
};

export const KIT_SHIPPING_LABEL: Record<KitShippingStatus, string> = {
  preparing: "배송 준비",
  shipping: "배송 중",
  delivered: "배송 완료",
};

export const KIT_SHIPPING_TONE: Record<KitShippingStatus, VirtualRunStatusTone> = {
  preparing: "wait",
  shipping: "progress",
  delivered: "ok",
};

export const KIT_CERT_LABEL: Record<KitCertStatus, string> = {
  none: "미제출",
  pending: "검수 중",
  approved: "승인",
  rejected: "반려",
};

export const KIT_CERT_TONE: Record<KitCertStatus, VirtualRunStatusTone> = {
  none: "wait",
  pending: "progress",
  approved: "ok",
  rejected: "err",
};

export const REWARD_KIND_CODE: Record<VirtualRunRewardRow["kind"], string> = {
  gifticon: "GIFT",
  coupon: "COUPON",
  sponsor: "SPONSOR",
};

export const REWARD_STATUS_LABEL: Record<VirtualRunRewardRow["status"], string> = {
  sent: "발송 완료",
  queued: "발송 예정",
  failed: "발송 실패",
};

export const REWARD_STATUS_TONE: Record<VirtualRunRewardRow["status"], VirtualRunStatusTone> = {
  sent: "ok",
  queued: "progress",
  failed: "err",
};

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 10) return phone;
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}
