import { adminFetch } from "@/lib/admin/fetch";
import { listPublicNotices } from "@/services/main/notices";
import type {
  AdminNoticeCreateBody,
  AdminNoticeDetail,
  AdminNoticeCategory,
  AdminNoticeListParams,
  AdminNoticeUpdateBody,
} from "./notices.types";

export async function listAdminNotices(params: AdminNoticeListParams = {}) {
  return listPublicNotices(params);
}

export async function listAdminNoticeCategories() {
  return adminFetch<AdminNoticeCategory[]>("v1/public/notices/notice/category");
}

export async function getAdminNotice(noticeId: string) {
  return adminFetch<AdminNoticeDetail>(
    `v1/public/notices/${encodeURIComponent(noticeId)}/detail`,
    { method: "POST" },
  );
}

export async function createAdminNotice(
  eventId: string,
  body: AdminNoticeCreateBody,
) {
  const id = eventId.trim();
  if (!id) throw new Error("대회 정보가 없습니다.");
  return adminFetch<{ id: string }>(
    `v1/event/${encodeURIComponent(id)}/notice`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateAdminNotice(
  noticeId: string,
  body: AdminNoticeUpdateBody,
) {
  return adminFetch<string>(
    `v1/notice/${encodeURIComponent(noticeId)}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function deleteAdminNotice(noticeId: string) {
  return adminFetch<string>(
    `v1/notice/${encodeURIComponent(noticeId)}`,
    { method: "DELETE" },
  );
}
