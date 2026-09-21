import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MembersListPage } from "@/components/admin/members/MembersListPage";
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
    title: event ? `${event.name} 회원 | 관리자` : "회원 관리 | 관리자",
  };
}

export default async function Page({ params }: Props) {
  const { eventId } = await params;
  const event = getAdminRaceEvent(eventId);
  if (!event) notFound();
  return (
    <Suspense>
      <MembersListPage slug={event.id as AdminRaceEventId} />
    </Suspense>
  );
}
