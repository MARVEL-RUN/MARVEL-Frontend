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
  const [saving, setSaving] = useState(false);

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap wrap--narrow">
        <form
          className="inquiry-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !title.trim() || !body.trim()) {
              alert("이름, 제목, 내용을 입력해 주세요.");
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
          <label>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            내용
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
          </label>
          <div className="inquiry-form__actions">
            <Link href="/inquiry" className="btn btn--ghost">
              취소
            </Link>
            <button type="submit" className="btn btn--red" disabled={saving}>
              {saving ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
