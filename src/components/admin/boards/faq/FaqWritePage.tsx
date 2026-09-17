"use client";

import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import { FAQ_CATEGORY_OPTIONS, isFaqCategory, type FaqCategory } from "@/lib/admin/faqCategories";
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
  const [category, setCategory] = useState<FaqCategory>("참가 신청");

  useEffect(() => {
    if (data) {
      setQuestion(data.question);
      setAnswer(data.answer);
      setCategory(isFaqCategory(data.category) ? data.category : "참가 신청");
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateFaq(id, { category, question, answer })
        : createFaq({ category, question, answer }),
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
          <label className="admin-form__category">
            카테고리
            <AdminSelect
              value={category}
              options={FAQ_CATEGORY_OPTIONS}
              onChange={setCategory}
              ariaLabel="카테고리"
              width={140}
            />
          </label>
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
