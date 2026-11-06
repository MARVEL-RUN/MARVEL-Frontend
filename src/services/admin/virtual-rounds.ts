import { adminFetch, adminFetchBlob } from "@/lib/admin/fetch";

export type VirtualRound = {
  startAt: string;
  deadline: string;
};

export type BibIssueCategory = {
  eventCategoryId: string;
  categoryName: string;
  issuedCount: number;
  firstNumber: number;
  lastNumber: number;
};

export type BibIssueResult = {
  issuedCount: number;
  alreadyIssuedCount: number;
  externalPaymentSkippedCount: number;
  registrationsWithoutEntriesCount: number;
  perCategory: BibIssueCategory[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function unwrap(data: unknown) {
  const row = asRecord(data);
  const inner = row?.data;
  if (inner && typeof inner === "object") return inner;
  return data;
}

function asRounds(data: unknown): VirtualRound[] {
  const body = unwrap(data);
  const row = asRecord(body);
  const source = Array.isArray(row?.rounds) ? row.rounds : [];
  return source.flatMap((item) => {
    const round = asRecord(item);
    if (!round) return [];
    return [{ startAt: asText(round.startAt), deadline: asText(round.deadline) }];
  });
}

function asBibIssue(data: unknown): BibIssueResult {
  const row = asRecord(unwrap(data)) ?? {};
  const categories = Array.isArray(row.perCategory) ? row.perCategory : [];
  return {
    issuedCount: asCount(row.issuedCount),
    alreadyIssuedCount: asCount(row.alreadyIssuedCount),
    externalPaymentSkippedCount: asCount(row.externalPaymentSkippedCount),
    registrationsWithoutEntriesCount: asCount(row.registrationsWithoutEntriesCount),
    perCategory: categories.flatMap((item) => {
      const category = asRecord(item);
      if (!category) return [];
      return [
        {
          eventCategoryId: asText(category.eventCategoryId),
          categoryName: asText(category.categoryName),
          issuedCount: asCount(category.issuedCount),
          firstNumber: asCount(category.firstNumber),
          lastNumber: asCount(category.lastNumber),
        },
      ];
    }),
  };
}

function eventPath(eventId: string, path: string) {
  return `v1/admin/virtual/${encodeURIComponent(eventId)}/${path}`;
}

export function fetchVirtualRounds(eventId: string) {
  return adminFetch<unknown>(eventPath(eventId, "rounds")).then(asRounds);
}

export function replaceVirtualRounds(eventId: string, rounds: VirtualRound[]) {
  return adminFetch<unknown>(eventPath(eventId, "rounds"), {
    method: "PUT",
    body: JSON.stringify({ rounds }),
  }).then(asRounds);
}

export function issueVirtualBibs(eventId: string, deadline: string) {
  return adminFetch<unknown>(eventPath(eventId, "bibs/issue"), {
    method: "POST",
    body: JSON.stringify({ deadline }),
  }).then(asBibIssue);
}

function downloadList(eventId: string, path: string, deadline: string, fallbackName: string) {
  const query = new URLSearchParams({ deadline });
  return adminFetchBlob(
    `${eventPath(eventId, path)}?${query}`,
    { method: "GET" },
    fallbackName,
  );
}

export function downloadVirtualPrintList(eventId: string, deadline: string, fallbackName: string) {
  return downloadList(eventId, "print-list/excel/download", deadline, fallbackName);
}

export function downloadVirtualPackingList(
  eventId: string,
  deadline: string,
  fallbackName: string,
) {
  return downloadList(eventId, "packing-list/excel/download", deadline, fallbackName);
}
