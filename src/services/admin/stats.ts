import { adminFetch, adminFetchBlob } from "@/lib/admin/fetch";
import { listAdminQuestions } from "./boards/inquiries";

export type RegistrationStatRow = {
  classification: string;
  courseCounts: Record<string, number>;
  totalCount: number;
  cardCount: number;
  easyPayCount?: number;
  unpaidCount?: number;
  personalCount: number;
  groupCount: number;
};

export type RegistrationStatistics = {
  courseHeaders: string[];
  genderStats: RegistrationStatRow[];
  ageGroupStats: RegistrationStatRow[];
  childStats: RegistrationStatRow[];
};

export function fetchRegistrationStatistics(eventId: string) {
  return adminFetch<RegistrationStatistics>(
    `v1/admin/registrations/${encodeURIComponent(eventId)}/statistics`,
  );
}

export type DailyReportMode = "DAILY" | "CUMULATIVE" | "BOTH";

export type DailyReportExcelParams = {
  eventId: string;
  startDate?: string;
  endDate?: string;
  mode?: DailyReportMode;
};

function dailyReportFallbackName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `일별접수집계_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
}

export function fetchDailyReportExcel(params: DailyReportExcelParams) {
  const eventId = params.eventId.trim();
  if (!eventId) throw new Error("대회 정보가 없습니다.");

  const query = new URLSearchParams();
  const startDate = params.startDate?.trim();
  const endDate = params.endDate?.trim();
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);
  if (params.mode) query.set("mode", params.mode);

  const qs = query.toString();
  const path = `v1/admin/registrations/${encodeURIComponent(eventId)}/daily-report/excel/download${
    qs ? `?${qs}` : ""
  }`;

  return adminFetchBlob(path, { method: "GET" }, dailyReportFallbackName());
}

export type DeliveryListExcelParams = {
  eventId: string;
  startAt: string;
  endAt: string;
};

function deliveryListFallbackName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `배송명단_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
}

/** 스펙 예시 `2026-10-07T00:00:00`. 오프셋 없는 KST */
function toDeliveryDateTime(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return "";
}

export function fetchDeliveryListExcel(params: DeliveryListExcelParams) {
  const eventId = params.eventId.trim();
  if (!eventId) throw new Error("대회 정보가 없습니다.");

  const startAt = toDeliveryDateTime(params.startAt);
  const endAt = toDeliveryDateTime(params.endAt);
  if (!startAt || !endAt) throw new Error("시작·종료 시각을 시·분·초까지 입력하세요.");
  if (startAt >= endAt) throw new Error("종료 시각은 시작보다 뒤여야 합니다.");

  const query = new URLSearchParams({ startAt, endAt });
  return adminFetchBlob(
    `v1/admin/registrations/${encodeURIComponent(eventId)}/delivery-list/excel/download?${query}`,
    { method: "GET" },
    deliveryListFallbackName(),
  );
}

export type PaymentDailyGraphDay = {
  date: string;
  dailyCount: number;
  cumulativeCount: number;
};

export type PaymentDailyGraph = {
  eventId: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  openingCumulativeCount: number;
  periodTotal: number;
  cumulativeTotal: number;
  days: PaymentDailyGraphDay[];
};

export function fetchPaymentDailyGraph(params: {
  eventId: string;
  startDate?: string;
  endDate?: string;
}) {
  const eventId = params.eventId.trim();
  if (!eventId) throw new Error("대회 정보가 없습니다.");

  const query = new URLSearchParams();
  const startDate = params.startDate?.trim();
  const endDate = params.endDate?.trim();
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);

  const qs = query.toString();
  return adminFetch<PaymentDailyGraph>(
    `v1/admin/registrations/${encodeURIComponent(eventId)}/graph/payment-daily${
      qs ? `?${qs}` : ""
    }`,
  );
}

export async function fetchUnansweredCount(eventIds: string[]) {
  const pages = await Promise.all(
    eventIds.map((eventId) =>
      listAdminQuestions({
        eventId,
        isAnswered: false,
        page: 0,
        size: 1,
        sort: "LATEST",
      }).catch(() => ({ totalElements: 0 })),
    ),
  );
  return pages.reduce((sum, page) => sum + (page.totalElements ?? 0), 0);
}
