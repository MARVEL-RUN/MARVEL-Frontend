"use client";

import { answerInquiry, deleteAnswer, getInquiry } from "@/services/admin/inquiries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function InquiryDetailPage() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", id],
    queryFn: () => getInquiry(id),
    enabled: Boolean(id),
  });
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (data?.answer) setAnswer(data.answer);
  }, [data]);

  const save = useMutation({
    mutationFn: () => answerInquiry(id, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      router.replace("/admin/boards/inquiry");
    },
  });

  const clear = useMutation({
    mutationFn: () => deleteAnswer(id),
    onSuccess: () => {
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    },
  });

  if (!id || (!isLoading && !data)) {
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
            <h2>{data?.title}</h2>
            <p style={{ margin: 0, color: "#5c6173", fontSize: 13 }}>
              {data?.name} · {data?.date}
            </p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{data?.body}</p>
          </article>
          <form
            className="admin-form admin-section-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (!answer.trim()) {
                alert("답변을 입력해 주세요.");
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
              {data?.answer ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    if (confirm("답변을 삭제할까요?")) clear.mutate();
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
                {save.isPending ? "저장 중..." : "답변 등록"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
