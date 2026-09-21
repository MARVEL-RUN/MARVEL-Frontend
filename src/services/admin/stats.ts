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
