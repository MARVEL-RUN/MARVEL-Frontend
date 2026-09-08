"use client";

import {
  draftToSections,
  getLegalDoc,
  saveLegalDoc,
  type LegalDocDraft,
  type LegalDocKind,
} from "@/services/admin/legal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const META: Record<LegalDocKind, { title: string }> = {
  terms: { title: "이용약관" },
  privacy: { title: "개인정보처리방침" },
};

export function LegalEditorPage({ kind }: { kind: LegalDocKind }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "legal", kind],
    queryFn: () => getLegalDoc(kind),
  });
  const [draft, setDraft] = useState<LegalDocDraft | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveLegalDoc(kind, draft as LegalDocDraft),
  });

  if (isLoading || !draft) {
    return (
      <div className="admin-page">
        <p className="admin-empty">불러오는 중…</p>
      </div>
    );
  }

  const updateSection = (index: number, patch: Partial<LegalDocDraft["sections"][number]>) => {
    setDraft({
      ...draft,
      sections: draft.sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section,
      ),
    });
  };

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>{META[kind].title} 수정</h1>
          <button
            type="button"
            className="admin-btn admin-btn--red"
            disabled={save.isPending}
            onClick={() => {
              if (!draftToSections(draft).length) {
                alert("조항을 한 개 이상 입력해 주세요.");
                return;
              }
              save.mutate();
            }}
          >
            {save.isPending ? "저장 중..." : save.isSuccess ? "저장됨" : "저장하기"}
          </button>
        </div>

        <form className="admin-form admin-legal-list">
          {kind === "privacy" ? (
            <label className="admin-section-card">
              머리말
              <textarea
                value={draft.lead}
                onChange={(e) => setDraft({ ...draft, lead: e.target.value })}
              />
            </label>
          ) : null}

          {draft.sections.map((section, index) => (
            <article key={`${section.title}-${index}`} className="admin-section-card">
              <label>
                조항 제목
                <input
                  value={section.title}
                  onChange={(e) => updateSection(index, { title: e.target.value })}
                />
              </label>
              <label>
                본문
                <textarea
                  className="is-tall"
                  value={section.body}
                  onChange={(e) => updateSection(index, { body: e.target.value })}
                />
              </label>
              <p style={{ margin: 0, fontSize: 12, color: "#7a7f90" }}>
                목록은 `- 항목`, 주석은 `&gt; 문구`, 소제목은 `## 제목` 형식입니다.
              </p>
            </article>
          ))}

          <label className="admin-section-card">
            시행일
            <input
              value={draft.effective}
              onChange={(e) => setDraft({ ...draft, effective: e.target.value })}
            />
          </label>
        </form>
        <p className="admin-empty" style={{ paddingTop: 0 }}>
          저장한 내용은 공개 페이지({kind === "terms" ? "/terms" : "/privacy"})에 반영됩니다.
        </p>
      </section>
    </div>
  );
}
