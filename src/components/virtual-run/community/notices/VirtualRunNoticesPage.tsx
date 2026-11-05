"use client";

import { NoticesPage } from "@/components/main/notices/NoticesPage";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { useVirtualRunCommunityBoard } from "../useVirtualRunCommunityBoard";

export function VirtualRunNoticesPage() {
  const board = useVirtualRunCommunityBoard();
  return <NoticesPage {...board} eventId={VIRTUAL_RUN_EVENT_ID || undefined} />;
}
