"use client";

import { createInquiry, listInquiries } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";

export function InquiryPage() {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    void listInquiries().then(setItems);
  };

  useEffect(() => {
    refresh();
  }, []);

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
              await createInquiry({ name, title, body });
              setName("");
              setTitle("");
              setBody("");
              refresh();
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
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
          </label>
          <button type="submit" className="btn btn--red" disabled={saving}>
            {saving ? "등록 중..." : "문의 등록"}
          </button>
        </form>

        <ul className="bulletin">
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="bulletin__btn"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="bulletin__tag">{item.answer ? "답변" : "대기"}</span>
                  <strong>{item.title}</strong>
                  <time>{item.date}</time>
                </button>
                {open ? (
                  <div className="bulletin__body">
                    <p>{item.body}</p>
                    {item.answer ? <p>A. {item.answer}</p> : <p>답변 준비 중입니다.</p>}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
