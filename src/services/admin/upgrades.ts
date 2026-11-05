import { adminFetch } from "@/lib/admin/fetch";

export type AdminUpgradeEntry = {
  eventCategoryName: string;
  name: string;
};

export type AdminUpgradeRow = {
  upgradeId: string;
  registrationId: string;
  name: string;
  currentCategoryName: string;
  targetCategoryName: string;
  amount: number;
  appliedAt: string;
  requestedAt: string;
  lastPaymentStatus: string;
  addedEntries: AdminUpgradeEntry[];
};

export type AdminUpgradeCancelResult = {
  upgradeId: string;
  registrationId: string;
  name: string;
  canceled: boolean;
  message: string;
};

export type AdminUpgradeBulkResult = {
  deadline: string;
  processedCount: number;
  canceledCount: number;
  failedCount: number;
  remainingCount: number;
  blockedCount: number;
  nextAfterUpgradeId: string | null;
  results: AdminUpgradeCancelResult[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function asAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const amount = Number(value.replace(/,/g, ""));
    if (Number.isFinite(amount)) return amount;
  }
  return 0;
}

function asCount(value: unknown) {
  const amount = asAmount(value);
  return amount > 0 ? Math.trunc(amount) : 0;
}

function unwrap(data: unknown) {
  const row = asRecord(data);
  if (!row) return data;
  const inner = row.data;
  if (inner && typeof inner === "object") return inner;
  return data;
}

function asEntries(value: unknown): AdminUpgradeEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const name = asText(row.name);
    const eventCategoryName = firstText(row.eventCategoryName, row.categoryName);
    if (!name && !eventCategoryName) return [];
    return [{ name, eventCategoryName }];
  });
}

function asUpgradeRow(value: unknown): AdminUpgradeRow | null {
  const row = asRecord(value);
  if (!row) return null;
  const upgradeId = asText(row.upgradeId);
  if (!upgradeId) return null;
  return {
    upgradeId,
    registrationId: asText(row.registrationId),
    name: firstText(row.name, row.applicantName),
    currentCategoryName: firstText(row.eventCategoryName, row.currentCategoryName, row.categoryName),
    targetCategoryName: asText(row.targetCategoryName),
    amount: asAmount(row.amount),
    appliedAt: firstText(row.appliedAt, row.registrationCreatedAt, row.createdAt),
    requestedAt: asText(row.requestedAt),
    lastPaymentStatus: firstText(row.lastPaymentStatus, row.paymentStatus),
    addedEntries: asEntries(row.addedEntries),
  };
}

function asList(data: unknown): AdminUpgradeRow[] {
  const body = unwrap(data);
  const row = asRecord(body);
  const source = Array.isArray(body)
    ? body
    : Array.isArray(row?.content)
      ? row.content
      : Array.isArray(row?.upgrades)
        ? row.upgrades
        : [];
  return source.flatMap((item) => {
    const parsed = asUpgradeRow(item);
    return parsed ? [parsed] : [];
  });
}

function asCancelResult(value: unknown): AdminUpgradeCancelResult {
  const row = asRecord(value) ?? {};
  return {
    upgradeId: asText(row.upgradeId),
    registrationId: asText(row.registrationId),
    name: asText(row.name),
    canceled: row.canceled === true,
    message: asText(row.message),
  };
}

function asBulk(data: unknown): AdminUpgradeBulkResult {
  const row = asRecord(unwrap(data)) ?? {};
  const results = Array.isArray(row.results) ? row.results.map(asCancelResult) : [];
  const next = asText(row.nextAfterUpgradeId);
  return {
    deadline: asText(row.deadline),
    processedCount: asCount(row.processedCount),
    canceledCount: asCount(row.canceledCount),
    failedCount: asCount(row.failedCount),
    remainingCount: asCount(row.remainingCount),
    blockedCount: asCount(row.blockedCount),
    nextAfterUpgradeId: next || null,
    results,
  };
}

export function fetchAdminUpgrades(eventId: string) {
  return adminFetch<unknown>(
    `v1/admin/virtual/${encodeURIComponent(eventId)}/upgrades`,
  ).then(asList);
}

export function cancelAdminUpgrade(eventId: string, upgradeId: string) {
  return adminFetch<unknown>(
    `v1/admin/virtual/${encodeURIComponent(eventId)}/upgrades/${encodeURIComponent(upgradeId)}/cancellation`,
    { method: "POST" },
  ).then(asCancelResult);
}

export function cancelAdminUpgrades(
  eventId: string,
  body: { deadline: string; afterUpgradeId: string | null },
) {
  return adminFetch<unknown>(
    `v1/admin/virtual/${encodeURIComponent(eventId)}/upgrades/cancellation`,
    { method: "POST", body: JSON.stringify(body) },
  ).then(asBulk);
}
