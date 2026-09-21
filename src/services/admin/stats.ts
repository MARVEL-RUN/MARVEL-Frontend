import {
  ADMIN_RACE_EVENTS,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { listAllApplications, type AdminApplicationRow } from "./applications";
import { listAdminQuestions } from "./boards/inquiries";

export type EventIntakeStats = {
  eventId: AdminRaceEventId;
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

function intakeFor(rows: AdminApplicationRow[]): Omit<EventIntakeStats, "eventId"> {
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
    confirmedCount: rows.filter((row) => row.status === "paid").length,
    participantCount:
      individuals.length + groups.reduce((sum, row) => sum + (row.memberCount ?? 0), 0),
    roundCounts,
  };
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
    (row) => row.status === "refund_requested",
  );

  return {
    unansweredCount: unanswered.totalElements,
    cancellationPendingCount: cancellationPending.length,
    cancellationPendingEventId: cancellationPending[0]?.eventId ?? null,
    events: ADMIN_RACE_EVENTS.map((event) => ({
      eventId: event.id,
      ...intakeFor(applications.filter((row) => row.eventId === event.id)),
    })),
  };
}
