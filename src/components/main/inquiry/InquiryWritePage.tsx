"use client";

import { createInquiry } from "@/services/admin/inquiries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SideBanner } from "../layout/SideBanner";

export function InquiryWritePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap">
        <form
          className="board-write"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !title.trim() || !body.trim()) {
              alert("작성자, 제목, 내용을 입력해 주세요.");
              return;
            }
            if (!agree) {
              alert("개인정보 수집·이용에 동의해 주세요.");
              return;
            }
            setSaving(true);
            try {
              const row = await createInquiry({ name, title, body });
              router.replace(`/inquiry/view?id=${row.id}`);
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="board-write__head">
            <h2>글쓰기</h2>
            <Link href="/inquiry" className="btn btn--ghost">
              목록
            </Link>
          </div>

          <div className="form-row">
            <span className="form-row__label">
              작성자 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>
          <div className="form-row">
            <span className="form-row__label">
              제목 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <input
                type="text"
                className="is-wide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row is-top">
            <span className="form-row__label">
              내용 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <textarea
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          <label className="board-write__agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              문의 접수 및 답변을 위해 작성자·문의내용을 수집·이용하는 데
              동의합니다.
            </span>
          </label>

          <div className="board-write__actions">
            <Link href="/inquiry" className="btn btn--ghost">
              목록
            </Link>
            <div className="board-write__actions-end">
              <Link href="/inquiry" className="btn btn--ghost">
                취소
              </Link>
              <button type="submit" className="btn btn--red" disabled={saving}>
                {saving ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
