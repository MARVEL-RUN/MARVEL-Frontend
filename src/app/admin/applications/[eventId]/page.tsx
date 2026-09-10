import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplicationsListPage } from "@/components/admin/applications/ApplicationsListPage";
import {
  ADMIN_RACE_EVENTS,
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";

type Props = {
  params: Promise<{ eventId: string }>;
};

export function generateStaticParams() {
  return ADMIN_RACE_EVENTS.map((event) => ({ eventId: event.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = getAdminRaceEvent(eventId);
  return {
    title: event ? `${event.name} 신청 | 관리자` : "참가신청 | 관리자",
  };
}

export default async function Page({ params }: Props) {
  const { eventId } = await params;
  const event = getAdminRaceEvent(eventId);
  if (!event) notFound();
  return <ApplicationsListPage eventId={event.id as AdminRaceEventId} />;
}
