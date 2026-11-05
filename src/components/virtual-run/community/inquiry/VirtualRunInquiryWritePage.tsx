"use client";

import { InquiryWritePage } from "@/components/main/inquiry/InquiryWritePage";
import { VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { useVirtualRunCommunityBoard } from "../useVirtualRunCommunityBoard";

export function VirtualRunInquiryWritePage() {
  const board = useVirtualRunCommunityBoard();
  return <InquiryWritePage {...board} eventId={VIRTUAL_RUN_EVENT_ID} />;
}
