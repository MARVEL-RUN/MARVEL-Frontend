import {
  canPrepareRegistrationPayment,
  closedRegistration,
  statusKey,
} from "@/lib/registration-status";
import type {
  MemberRegistrationPolicy,
  OrganizationRegistrationPolicy,
  RegistrationPolicyReason,
  RegistrationReceipt,
  UserRegistrationPolicy,
} from "@/services/main/types";

export function parsePolicyReason(value: unknown): RegistrationPolicyReason | null {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value : null;
  if (!row) return null;
  const code = typeof (row as { code?: unknown }).code === "string"
    ? (row as { code: string }).code.trim()
    : "";
  const message = typeof (row as { message?: unknown }).message === "string"
    ? (row as { message: string }).message.trim()
    : "";
  if (!code && !message) return null;
  return { code: code || "UNKNOWN", message: message || code };
}

function parseUserPolicy(raw: unknown): UserRegistrationPolicy | undefined {
  const row = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  if (!row) return undefined;
  const modifyAllowed = (row as { modifyAllowed?: unknown }).modifyAllowed === true;
  const paymentAllowed = (row as { paymentAllowed?: unknown }).paymentAllowed === true;
  const refundAllowed = (row as { refundAllowed?: unknown }).refundAllowed === true;
  return {
    modifyAllowed,
    modifyReason: parsePolicyReason((row as { modifyReason?: unknown }).modifyReason),
    paymentAllowed,
    paymentReason: parsePolicyReason((row as { paymentReason?: unknown }).paymentReason),
    refundAllowed,
    refundReason: parsePolicyReason((row as { refundReason?: unknown }).refundReason),
  };
}

function parseOrganizationPolicy(raw: unknown): OrganizationRegistrationPolicy | undefined {
  const row = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  if (!row) return undefined;
  const modifyAllowed = (row as { modifyAllowed?: unknown }).modifyAllowed === true;
  const paymentAllowed = (row as { paymentAllowed?: unknown }).paymentAllowed === true;
  const refundAllowed = (row as { refundAllowed?: unknown }).refundAllowed === true;
  const addMemberAllowed = (row as { addMemberAllowed?: unknown }).addMemberAllowed === true;
  return {
    modifyAllowed,
    modifyReason: parsePolicyReason((row as { modifyReason?: unknown }).modifyReason),
    paymentAllowed,
    paymentReason: parsePolicyReason((row as { paymentReason?: unknown }).paymentReason),
    refundAllowed,
    refundReason: parsePolicyReason((row as { refundReason?: unknown }).refundReason),
    addMemberAllowed,
    addMemberReason: parsePolicyReason((row as { addMemberReason?: unknown }).addMemberReason),
  };
}

export function parseMemberPolicy(raw: unknown): MemberRegistrationPolicy | undefined {
  const row = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  if (!row) return undefined;
  const modifyAllowed = (row as { modifyAllowed?: unknown }).modifyAllowed === true;
  const deleteMemberAllowed = (row as { deleteMemberAllowed?: unknown }).deleteMemberAllowed === true;
  return {
    modifyAllowed,
    modifyReason: parsePolicyReason((row as { modifyReason?: unknown }).modifyReason),
    deleteMemberAllowed,
    deleteMemberReason: parsePolicyReason(
      (row as { deleteMemberReason?: unknown }).deleteMemberReason,
    ),
  };
}

export { parseOrganizationPolicy, parseUserPolicy };

export function receiptHasActionPolicy(receipt: RegistrationReceipt) {
  return Boolean(receipt.userPolicy || receipt.organizationPolicy);
}

export function isFirstUnpaidRegistration(receipt: RegistrationReceipt) {
  const status = statusKey(receipt.registrationStatus);
  const paid = Number(receipt.paidAmount);
  return paid === 0 && (status === "PAYMENT_PENDING" || status === "EXPIRED");
}

/** 개인 수정 또는 단체 공통정보 수정(organizationPolicy.modify) */
export function lookupModifyAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  if (closedRegistration(receipt.registrationStatus)) return false;
  if (receipt.userPolicy) return receipt.userPolicy.modifyAllowed;
  if (receipt.organizationPolicy) return receipt.organizationPolicy.modifyAllowed;
  return Boolean(receipt.registrationId || receipt.organizationId);
}

export function lookupOrganizationCommonModifyAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  if (closedRegistration(receipt.registrationStatus)) return false;
  const org = receipt.organizationPolicy;
  if (org) return org.modifyAllowed;
  return Boolean(receipt.organizationId);
}

/** 배송 확정(REGISTRATION_PERIOD_PAYMENT) 시 단체장 성명·생년월일·연락처·주소는 함께 잠금 */
export function lookupOrganizationShippingModifyAllowed(receipt: RegistrationReceipt) {
  if (!lookupOrganizationCommonModifyAllowed(receipt)) return false;
  const org = receipt.organizationPolicy;
  return !(org && !org.paymentAllowed && org.paymentReason?.code === "REGISTRATION_PERIOD_PAYMENT");
}

/** 단체 수정 화면 진입 — 공통 false여도 구성원·추가 policy (인수인계 10.2) */
export function lookupOrganizationEditScreenAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  if (closedRegistration(receipt.registrationStatus)) return false;
  if (!receipt.organizationId) return false;
  const org = receipt.organizationPolicy;
  if (!org) return true;
  if (org.modifyAllowed || org.addMemberAllowed) return true;
  for (const row of receipt.registrations ?? []) {
    if (row.canceled) continue;
    const mp = row.memberPolicy;
    if (!mp) return true;
    if (mp.modifyAllowed || mp.deleteMemberAllowed) return true;
  }
  return false;
}

export function lookupEditScreenAllowed(receipt: RegistrationReceipt) {
  if (receipt.organizationId) return lookupOrganizationEditScreenAllowed(receipt);
  return lookupModifyAllowed(receipt);
}

function startGroupBlockedStatus(status?: string | null) {
  const key = statusKey(status);
  return key === "CANCELED" || key === "CANCELLATION_PENDING" || key === "EXPIRED";
}

/** 출발 그룹 전용 PATCH — 수정 화면에서 못 바꿀 때(modifyAllowed false·외부결제)만 노출 */
export function lookupPersonalStartGroupEditAllowed(receipt: RegistrationReceipt) {
  if (!receipt.registrationId?.trim()) return false;
  if (receipt.organizationId) return false;
  if (lookupModifyAllowed(receipt)) return false;
  return !startGroupBlockedStatus(receipt.registrationStatus);
}

export function lookupOrganizationStartGroupEditAllowed(receipt: RegistrationReceipt) {
  if (!receipt.organizationId?.trim()) return false;
  if (closedRegistration(receipt.registrationStatus)) return false;
  const editScreen = lookupOrganizationEditScreenAllowed(receipt);
  const rows =
    receipt.registrations?.length
      ? receipt.registrations
      : receipt.members ?? [];
  return rows.some((row) => {
    if (row.canceled) return false;
    if (!row.registrationId?.trim()) return false;
    if (startGroupBlockedStatus(row.registrationStatus)) return false;
    const memberPolicy = "memberPolicy" in row ? row.memberPolicy : undefined;
    return !editScreen || !memberModifyAllowed(memberPolicy, true);
  });
}

export function lookupRefundOrCancelAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  if (closedRegistration(receipt.registrationStatus)) return false;
  if (receipt.organizationPolicy) return receipt.organizationPolicy.refundAllowed;
  if (receipt.userPolicy) {
    if (isFirstUnpaidRegistration(receipt)) return true;
    return receipt.userPolicy.refundAllowed;
  }
  if (isFirstUnpaidRegistration(receipt)) return true;
  return lookupModifyAllowed(receipt);
}

/** policy + 실제 환불·취소 대상 여부 (완납·0원 등) */
export function lookupShowRefundOrCancelButton(receipt: RegistrationReceipt) {
  if (!lookupRefundOrCancelAllowed(receipt)) return false;
  if (isFirstUnpaidRegistration(receipt)) return true;
  return Number(receipt.paidAmount) > 0;
}

export function lookupPaymentPolicyAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  const policy = receipt.userPolicy ?? receipt.organizationPolicy;
  if (policy && !policy.paymentAllowed) return false;
  return true;
}

export function lookupShowPaymentButton(receipt: RegistrationReceipt) {
  if (!lookupPaymentPolicyAllowed(receipt)) return false;
  const action = statusKey(receipt.paymentAction);
  if (action === "PAYMENT_CLOSED") return false;
  const due = (receipt.totalAmount ?? 0) - (receipt.paidAmount ?? 0);
  if (due <= 0) return false;
  if (action === "PREPARE_PAYMENT" || action === "PREPARE_ADDITIONAL_PAYMENT") {
    return Boolean(receipt.paymentId) || Boolean(receipt.orderId);
  }
  return (
    canPrepareRegistrationPayment(receipt.registrationStatus) && Boolean(receipt.paymentId)
  );
}

export function lookupPolicyNotes(receipt: RegistrationReceipt) {
  const lines: string[] = [];
  const push = (reason: RegistrationPolicyReason | null | undefined) => {
    const text = reason?.message?.trim();
    if (text && !lines.includes(text)) lines.push(text);
  };

  const user = receipt.userPolicy;
  const org = receipt.organizationPolicy;
  const policy = user ?? org;

  if (policy) {
    if (!lookupModifyAllowed(receipt)) push(policy.modifyReason);
    if (!lookupPaymentPolicyAllowed(receipt)) push(policy.paymentReason);
    if (!lookupRefundOrCancelAllowed(receipt)) push(policy.refundReason);
  }
  if (org && !org.addMemberAllowed) push(org.addMemberReason);

  return lines;
}

export function memberModifyAllowed(
  memberPolicy: MemberRegistrationPolicy | undefined,
  fallback = true,
) {
  if (!memberPolicy) return fallback;
  return memberPolicy.modifyAllowed;
}

export function memberDeleteAllowed(
  memberPolicy: MemberRegistrationPolicy | undefined,
  fallback: boolean,
) {
  if (!memberPolicy) return fallback;
  return memberPolicy.deleteMemberAllowed;
}

export function organizationAddMemberAllowed(receipt: RegistrationReceipt) {
  if (receipt.externalPayment) return false;
  const org = receipt.organizationPolicy;
  if (!org) return true;
  return org.addMemberAllowed;
}

export function policyReasonMessage(
  reason: RegistrationPolicyReason | null | undefined,
) {
  return reason?.message?.trim() || "";
}

export function memberLookupPolicyNotes(
  memberPolicy: MemberRegistrationPolicy | undefined,
) {
  if (!memberPolicy) return [];
  const lines: string[] = [];
  const push = (reason: RegistrationPolicyReason | null | undefined) => {
    const text = policyReasonMessage(reason);
    if (text && !lines.includes(text)) lines.push(text);
  };
  if (!memberPolicy.modifyAllowed) push(memberPolicy.modifyReason);
  if (!memberPolicy.deleteMemberAllowed) push(memberPolicy.deleteMemberReason);
  return lines;
}

