import { adminFetch } from "@/lib/admin/fetch";
import type { AdminAnswerDetail, AnswerWriteBody } from "./inquiries.types";

export async function getAdminAnswer(answerId: string) {
  return adminFetch<AdminAnswerDetail>(
    `v1/admin/answers/${encodeURIComponent(answerId)}`,
  );
}

export async function createAnswer(questionId: string, body: AnswerWriteBody) {
  return adminFetch<{ id: string }>(
    `v1/questions/${encodeURIComponent(questionId)}/answer`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateAnswer(answerId: string, body: AnswerWriteBody) {
  return adminFetch<void>(`v1/answers/${encodeURIComponent(answerId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAnswer(answerId: string) {
  return adminFetch<void>(`v1/answers/${encodeURIComponent(answerId)}`, {
    method: "DELETE",
  });
}
