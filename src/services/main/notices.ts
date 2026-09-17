import { mainFetch } from "@/lib/main/fetch";
import type {
  NoticeRow,
  PinnedNotice,
  PublicNoticeListItem,
  PublicNoticeListParams,
  PublicNoticeListResponse,
  PublicNoticeDetail,
} from "@/types/main/notices";

function toQuery(params: PublicNoticeListParams) {
  const q = new URLSearchParams();
  if (params.eventId) q.set("eventId", params.eventId);
  if (params.target) q.set("target", params.target);
  if (params.keyword?.trim()) q.set("keyword", params.keyword.trim());
  q.set("page", String(params.page ?? 0));
  q.set("size", String(params.size ?? 20));
  if (params.limit != null) q.set("limit", String(params.limit));
  q.set("sort", params.sort ?? "LATEST");
  return q.toString();
}

export function mergeNoticeList(
  pinned: PinnedNotice[] = [],
  content: PublicNoticeListItem[] = [],
): NoticeRow[] {
  const ids = new Set(pinned.map((row) => row.id));
  return [
    ...pinned.map((row) => ({ ...row, pinned: true })),
    ...content
      .filter((row) => !ids.has(row.id))
      .map((row) => ({ ...row, pinned: false })),
  ];
}

export async function listPublicNotices(params: PublicNoticeListParams = {}) {
  return mainFetch<PublicNoticeListResponse>(
    `v1/public/notices?${toQuery(params)}`,
  );
}

export async function getPublicNoticeDetail(noticeId: string) {
  return mainFetch<PublicNoticeDetail>(
    `v1/public/notices/${encodeURIComponent(noticeId)}/detail`,
    { method: "POST" },
  );
}
