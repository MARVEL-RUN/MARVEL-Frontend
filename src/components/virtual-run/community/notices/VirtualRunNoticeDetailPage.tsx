"use client";

import { NoticeDetailPage } from "@/components/main/notices/NoticeDetailPage";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { useVirtualRunCommunityBoard } from "../useVirtualRunCommunityBoard";

export function VirtualRunNoticeDetailPage() {
  const { toHref } = useVirtualRunCommunityBoard();
  return (
    <NoticeDetailPage eventId={VIRTUAL_RUN_EVENT_ID || undefined} toHref={toHref} />
  );
}
