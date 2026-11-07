import type { ParticipantEntry } from "./participant-auth";

export type ParticipantOrderItem = {
  itemId: string;
  eventCategoryId: string;
  eventCategoryName: string;
  productType: string;
  amount: number;
  canceledAt: string | null;
  entries: ParticipantOrderEntry[];
};

export type ParticipantOrderEntry = {
  entryId: string;
  eventCategoryId: string;
  eventCategoryName: string;
  name: string;
  phNum: string;
  birth: string;
  gender: string;
  bibNumber: string;
};

/** 주문 조회 한 건. order는 공개 신청 조회와 같은 필드만 골라 둔다 */
export type ParticipantOrder = {
  registrationId: string;
  canceled: boolean;
  modificationDeadline: string | null;
  refundDeadline: string | null;
  items: ParticipantOrderItem[];
  eventCategoryName: string;
  registrationStatus: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  refundStatus: string;
  paymentAction: string;
  paymentId: string;
  orderId: string;
  address: string;
  addressDetail: string;
  name: string;
  phNum: string;
  birth: string;
  gender: string;
  modifyAllowed: boolean;
  refundAllowed: boolean;
  paymentAllowed: boolean;
  externalPayment: boolean;
  hasPendingUpgrade: boolean;
};

export type ParticipantOrderSettlement = {
  refundCount: number;
  refundAmount: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const amount = Number(value);
    if (Number.isFinite(amount)) return amount;
  }
  return 0;
}

function asNullableText(value: unknown) {
  const text = asText(value);
  return text || null;
}

function parseEntry(value: unknown, item: ParticipantOrderItem): ParticipantOrderEntry | null {
  const row = asRecord(value);
  const entryId = asText(row?.entryId);
  if (!entryId) return null;
  return {
    entryId,
    eventCategoryId: asText(row?.eventCategoryId) || item.eventCategoryId,
    eventCategoryName: asText(row?.eventCategoryName) || item.eventCategoryName,
    name: asText(row?.name),
    phNum: asText(row?.phNum).replace(/\D/g, ""),
    birth: asText(row?.birth),
    gender: asText(row?.gender).toUpperCase(),
    bibNumber: asText(row?.bibNumber),
  };
}

function parseItem(value: unknown): ParticipantOrderItem | null {
  const row = asRecord(value);
  if (!row) return null;
  const item: ParticipantOrderItem = {
    itemId: asText(row.itemId),
    eventCategoryId: asText(row.eventCategoryId),
    eventCategoryName: asText(row.eventCategoryName),
    productType: asText(row.productType),
    amount: asAmount(row.amount),
    canceledAt: asNullableText(row.canceledAt),
    entries: [],
  };
  if (!item.itemId && !item.eventCategoryId) return null;
  const entries = Array.isArray(row.entries) ? row.entries : [];
  item.entries = entries.flatMap((entry) => {
    const parsed = parseEntry(entry, item);
    return parsed ? [parsed] : [];
  });
  return item;
}

export function parseParticipantOrder(data: unknown): ParticipantOrder {
  const row = asRecord(data);
  const order = asRecord(row?.order) ?? {};
  const policy = asRecord(order.userPolicy);
  const policyKnown = Boolean(policy);
  const items = Array.isArray(row?.items) ? row.items.flatMap((item) => {
    const parsed = parseItem(item);
    return parsed ? [parsed] : [];
  }) : [];
  const registrationId = asText(order.registrationId) || asText(row?.registrationId);
  return {
    registrationId,
    canceled: row?.canceled === true || asText(order.registrationStatus) === "CANCELED",
    modificationDeadline: asNullableText(row?.modificationDeadline),
    refundDeadline: asNullableText(row?.refundDeadline),
    items,
    eventCategoryName: asText(order.eventCategoryName),
    registrationStatus: asText(order.registrationStatus),
    totalAmount: asAmount(order.totalAmount),
    paidAmount: asAmount(order.paidAmount),
    paymentStatus: asText(order.paymentStatus),
    refundStatus: asText(order.refundStatus),
    paymentAction: asText(order.paymentAction),
    paymentId: asText(order.paymentId),
    orderId: asText(order.orderId),
    address: asText(order.address),
    addressDetail: asText(order.addressDetail),
    name: asText(order.name),
    phNum: asText(order.phNum).replace(/\D/g, ""),
    birth: asText(order.birth),
    gender: asText(order.gender).toUpperCase(),
    modifyAllowed: policyKnown ? policy?.modifyAllowed === true : true,
    refundAllowed: policyKnown ? policy?.refundAllowed === true : true,
    paymentAllowed: policyKnown ? policy?.paymentAllowed === true : true,
    externalPayment: order.externalPayment === true,
    hasPendingUpgrade: Boolean(asRecord(order.pendingUpgrade)?.upgradeId),
  };
}

export function parseParticipantOrderList(data: unknown) {
  const list = Array.isArray(data) ? data : [];
  return list.map(parseParticipantOrder).filter((order) => order.registrationId);
}

/** 받는 사람 수정에 쓰는 평탄 목록. 취소된 구매 줄은 빼 둔다 */
export function entriesFromParticipantOrder(order: ParticipantOrder): ParticipantEntry[] {
  const entries: ParticipantEntry[] = [];
  order.items.forEach((item, itemIndex) => {
    if (item.canceledAt) return;
    for (const entry of item.entries) {
      entries.push({
        entryId: entry.entryId,
        itemSortOrder: itemIndex,
        productId: item.eventCategoryId,
        productName: item.eventCategoryName,
        eventCategoryId: entry.eventCategoryId,
        categoryName: entry.eventCategoryName,
        name: entry.name,
        phNum: entry.phNum,
        birth: entry.birth,
        gender: entry.gender,
      });
    }
  });
  return entries;
}

export function orderProductLabel(order: ParticipantOrder) {
  const names = order.items
    .filter((item) => !item.canceledAt)
    .map((item) => item.eventCategoryName)
    .filter(Boolean);
  if (names.length) return names.join(" · ");
  return order.eventCategoryName;
}

export function parseOrderSettlement(data: unknown): ParticipantOrderSettlement {
  const row = asRecord(data);
  const refunds = Array.isArray(row?.refunds) ? row.refunds : [];
  const refundAmount = refunds.reduce((sum, item) => sum + asAmount(asRecord(item)?.amount), 0);
  return { refundCount: refunds.length, refundAmount };
}
