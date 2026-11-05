"use client";

import { InquiryViewPage } from "@/components/main/inquiry/InquiryViewPage";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { useVirtualRunCommunityBoard } from "../useVirtualRunCommunityBoard";

export function VirtualRunInquiryViewPage() {
  const { toHref } = useVirtualRunCommunityBoard();
  return <InquiryViewPage eventId={VIRTUAL_RUN_EVENT_ID} toHref={toHref} />;
}
