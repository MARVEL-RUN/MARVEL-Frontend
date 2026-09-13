"use client";

import { adminToast } from "@/components/admin/Toast";
import { createFaq, getFaq, updateFaq } from "@/services/admin/faqs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function FaqWritePage({ mode }: { mode: "write" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const editing = mode === "edit";
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "faqs", id],
    queryFn: () => getFaq(id),
    enabled: editing && Boolean(id),
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (data) {
      setQuestion(data.question);
      setAnswer(data.answer);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      editing ? updateFaq(id, { question, answer }) : createFaq({ question, answer }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
      adminToast.success(editing ? "FAQ가 수정되었습니다." : "FAQ가 등록되었습니다.");
      router.replace("/admin/boards/faq");
    },
    onError: () => {
      adminToast.error(editing ? "FAQ 수정에 실패했습니다." : "FAQ 등록에 실패했습니다.");
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert("질문과 답변을 입력해 주세요.");
      return;
    }
    save.mutate();
  };

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>{editing ? "FAQ 수정" : "FAQ 등록"}</h1>
        </div>
        <form className="admin-form admin-section-card" onSubmit={submit}>
          <label>
            질문
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요"
            />
          </label>
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
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => router.push("/admin/boards/faq")}
            >
              취소하기
            </button>
            <button type="submit" className="admin-btn admin-btn--red" disabled={save.isPending}>
              {save.isPending ? "저장 중..." : editing ? "수정하기" : "등록하기"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
