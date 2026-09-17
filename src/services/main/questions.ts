import { mainFetch } from "@/lib/main/fetch";
import type {
  CreatePublicQuestionBody,
  PublicAnswerDetail,
  PublicQuestionDetailResponse,
  PublicQuestionListItem,
  PublicQuestionListParams,
  SpringPage,
  UpdatePublicQuestionBody,
} from "@/types/main/questions";

/** 목록·잠긴 상세에 보이는 제목 */
export const INQUIRY_PUBLIC_TITLE = "[문의]";

function toQuery(params: PublicQuestionListParams) {
  const q = new URLSearchParams();
  if (params.eventId) q.set("eventId", params.eventId);
  if (params.target) q.set("target", params.target);
  if (params.keyword?.trim()) q.set("keyword", params.keyword.trim());
  q.set("page", String(params.page ?? 0));
  q.set("size", String(params.size ?? 20));
  q.set("sort", params.sort ?? "LATEST");
  return q.toString();
}

export async function listPublicQuestions(params: PublicQuestionListParams = {}) {
  return mainFetch<SpringPage<PublicQuestionListItem>>(
    `v1/public/questions?${toQuery(params)}`,
  );
}

export async function getPublicQuestionDetail(
  questionId: string,
  password: string,
) {
  return mainFetch<PublicQuestionDetailResponse>(
    `v1/public/questions/${encodeURIComponent(questionId)}/detail`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    },
  );
}

export async function getPublicAnswerDetail(answerId: string, password: string) {
  return mainFetch<PublicAnswerDetail>(
    `v1/public/answers/${encodeURIComponent(answerId)}/detail`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    },
  );
}

export async function createPublicQuestion(
  eventId: string,
  body: CreatePublicQuestionBody,
) {
  return mainFetch<unknown>(
    `v1/public/questions?eventId=${encodeURIComponent(eventId)}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updatePublicQuestion(
  questionId: string,
  body: UpdatePublicQuestionBody,
) {
  return mainFetch<unknown>(
    `v1/public/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deletePublicQuestion(
  questionId: string,
  password: string,
) {
  return mainFetch<unknown>(
    `v1/public/questions/${encodeURIComponent(questionId)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ password }),
    },
  );
}
