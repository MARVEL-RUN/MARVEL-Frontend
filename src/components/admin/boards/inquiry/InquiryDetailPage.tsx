"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { adminToast } from "@/components/admin/Toast";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  createAnswer,
  deleteAnswer,
  updateAnswer,
} from "@/services/admin/boards/answers";
import { getAdminQuestion } from "@/services/admin/boards/inquiries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ANSWER_TITLE = "답변";

export function InquiryDetailPage() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", id],
    queryFn: () => getAdminQuestion(id),
    enabled: Boolean(id),
  });
  const [answer, setAnswer] = useState("");
  const { confirm, modal } = useAdminConfirm();

  const question = data?.questionDetail;
  const answerDetail = data?.answerDetail ?? null;

  useEffect(() => {
    setAnswer(answerDetail?.content ?? "");
  }, [answerDetail?.content, id]);

  const save = useMutation({
    mutationFn: async () => {
      const body = { title: ANSWER_TITLE, content: answer.trim() };
      if (answerDetail?.id) {
        await updateAnswer(answerDetail.id, body);
        return;
      }
      await createAnswer(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      adminToast.success(
        answerDetail?.id ? "답변이 수정되었습니다." : "답변이 등록되었습니다.",
      );
      router.replace("/admin/boards/inquiry");
    },
    onError: () =>
      adminToast.error(
        answerDetail?.id ? "답변 수정에 실패했습니다." : "답변 등록에 실패했습니다.",
      ),
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!answerDetail?.id) throw new Error("답변이 없습니다.");
      await deleteAnswer(answerDetail.id);
    },
    onSuccess: () => {
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      adminToast.success("답변이 삭제되었습니다.");
    },
    onError: () => adminToast.error("답변 삭제에 실패했습니다."),
  });

  if (!id || (!isLoading && !question)) {
    return (
      <div className="admin-page">
        <p className="admin-empty">문의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>문의 상세</h1>
        </div>
        <div className="admin-legal-list">
          <article className="admin-section-card">
            <h2>{question?.title}</h2>
            <p style={{ margin: 0, color: "#5c6173", fontSize: 14 }}>
              {question?.author} · {formatAdminBoardDate(question?.createdAt)}
              {question?.secret ? " · 비밀글" : ""}
            </p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{question?.content}</p>
          </article>
          <form
            className="admin-form admin-section-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (!answer.trim()) {
                adminToast.error("답변을 입력해 주세요.");
                return;
              }
              save.mutate();
            }}
          >
            <label>
              답변
              <textarea
                className="is-tall"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요"
              />
            </label>
            <div className="admin-form__actions">
              {answerDetail?.id ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={async () => {
                    if (await confirm("답변을 삭제할까요?")) clear.mutate();
                  }}
                >
                  답변 삭제
                </button>
              ) : null}
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => router.push("/admin/boards/inquiry")}
              >
                목록
              </button>
              <button type="submit" className="admin-btn admin-btn--red" disabled={save.isPending}>
                {save.isPending
                  ? "저장 중..."
                  : answerDetail?.id
                    ? "답변 수정"
                    : "답변 등록"}
              </button>
            </div>
          </form>
        </div>
      </section>
      {modal}
    </div>
  );
}
