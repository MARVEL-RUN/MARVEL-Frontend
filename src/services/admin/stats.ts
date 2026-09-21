import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { statusKey } from "@/lib/registration-status";
import { DEFAULT_EVENT_ID } from "@/lib/main/config";
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

export type DailyApplicantStat = {
  date: string;
  total: number;
  individual: number;
  group: number;
};

export type AdminDashboardStats = {
  unansweredCount: number;
  cancellationPendingCount: number;
  cancellationPendingEventId: string | null;
  events: EventIntakeStats[];
  dailyApplicants: DailyApplicantStat[];
};

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

/** appliedAt: `YYYY.MM.DD HH:mm` → `YYYY-MM-DD` */
function dayKeyFromAppliedAt(appliedAt: string) {
  const match = appliedAt.trim().match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function dailyApplicantsFrom(rows: AdminApplicationRow[]): DailyApplicantStat[] {
  const map = new Map<string, DailyApplicantStat>();
  for (const row of rows) {
    const date = dayKeyFromAppliedAt(row.appliedAt);
    if (!date) continue;
    const current = map.get(date) ?? { date, total: 0, individual: 0, group: 0 };
    current.total += 1;
    if (row.kind === "group") current.group += 1;
    else current.individual += 1;
    map.set(date, current);
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [applications, unanswered] = await Promise.all([
    listAllApplications(),
    listAdminQuestions({
      eventId: DEFAULT_EVENT_ID,
      isAnswered: false,
      page: 0,
      size: 1,
      sort: "LATEST",
    }).catch(() => ({ totalElements: 0 })),
  ]);

  const cancellationPending = applications.filter(
    (row) => statusKey(row.status) === "CANCELLATION_PENDING",
  );

  const events = await fetchAdminEvents().catch(() => []);

  return {
    unansweredCount: unanswered.totalElements,
    cancellationPendingCount: cancellationPending.length,
    cancellationPendingEventId: cancellationPending[0]?.eventId ?? null,
    events: events.map((event) => {
      const slug = raceEventSlug(event);
      const key = slug ?? event.eventId;
      return {
        eventId: key,
        eventName: event.eventName,
        slug,
        ...intakeFor(applications.filter((row) => row.eventId === key)),
      };
    }),
    dailyApplicants: dailyApplicantsFrom(applications),
  };
}
