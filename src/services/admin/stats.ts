import { adminFetch, adminFetchBlob } from "@/lib/admin/fetch";
import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { statusKey } from "@/lib/registration-status";
import {
  fetchAdminEvents,
  listAllApplications,
  raceEventSlug,
  type AdminApplicationRow,
} from "./applications";
import { listAdminQuestions } from "./boards/inquiries";

export type EventIntakeStats = {
  eventId: string;
  eventName: string;
  slug: AdminRaceEventId | null;
  individualCount: number;
  groupCount: number;
  confirmedCount: number;
  participantCount: number;
  roundCounts: [number, number, number];
};

export type AdminDashboardStats = {
  unansweredCount: number;
  cancellationPendingCount: number;
  cancellationPendingEventId: string | null;
  events: EventIntakeStats[];
};

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

function intakeFor(
  rows: AdminApplicationRow[],
): Omit<EventIntakeStats, "eventId" | "eventName" | "slug"> {
  const individuals = rows.filter((row) => row.kind === "individual");
  const groups = rows.filter((row) => row.kind === "group");
  const roundCounts: [number, number, number] = [0, 0, 0];
  for (const row of rows) {
    if (row.round === "1") roundCounts[0] += 1;
    else if (row.round === "2") roundCounts[1] += 1;
    else if (row.round === "3") roundCounts[2] += 1;
  }
  return {
    individualCount: individuals.length,
    groupCount: groups.length,
    confirmedCount: rows.filter((row) => statusKey(row.status) === "CONFIRMED").length,
    participantCount:
      individuals.length + groups.reduce((sum, row) => sum + (row.memberCount ?? 0), 0),
    roundCounts,
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const events = await fetchAdminEvents().catch(() => []);

  const [applications, ...unansweredPages] = await Promise.all([
    listAllApplications(),
    ...events.map((event) =>
      listAdminQuestions({
        eventId: event.eventId,
        isAnswered: false,
        page: 0,
        size: 1,
        sort: "LATEST",
      }).catch(() => ({ totalElements: 0 })),
    ),
  ]);

  const cancellationPending = applications.filter(
    (row) => statusKey(row.status) === "CANCELLATION_PENDING",
  );

  const unansweredCount = unansweredPages.reduce(
    (sum, page) => sum + (page.totalElements ?? 0),
    0,
  );

  return {
    unansweredCount,
    cancellationPendingCount: cancellationPending.length,
    cancellationPendingEventId: cancellationPending[0]?.eventId ?? null,
    events: events.map((event) => {
      const slug = raceEventSlug(event);
      return {
        eventId: event.eventId,
        eventName: event.eventName,
        slug,
        ...intakeFor(applications.filter((row) => row.eventId === event.eventId)),
      };
    }),
  };
}
