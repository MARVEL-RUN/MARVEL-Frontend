import { adminFetch } from "@/lib/admin/fetch";
import type {
  AdminQuestionDetailResponse,
  AdminQuestionListItem,
  AdminQuestionListParams,
  SpringPage,
} from "./inquiries.types";

function toQuery(params: AdminQuestionListParams) {
  const q = new URLSearchParams();
  if (params.eventId) q.set("eventId", params.eventId);
  if (params.target) q.set("target", params.target);
  if (params.keyword?.trim()) q.set("keyword", params.keyword.trim());
  if (params.isAnswered !== undefined) {
    q.set("isAnswered", String(params.isAnswered));
  }
  q.set("page", String(params.page ?? 0));
  q.set("size", String(params.size ?? 20));
  q.set("sort", params.sort ?? "LATEST");
  return q.toString();
}

export async function listAdminQuestions(params: AdminQuestionListParams = {}) {
  const query = toQuery(params);
  return adminFetch<SpringPage<AdminQuestionListItem>>(
    `v1/admin/questions?${query}`,
  );
}

export async function getAdminQuestion(questionId: string) {
  return adminFetch<AdminQuestionDetailResponse>(
    `v1/admin/questions/${encodeURIComponent(questionId)}`,
  );
}
