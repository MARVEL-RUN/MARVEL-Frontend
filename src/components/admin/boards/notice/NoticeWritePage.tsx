"use client";

import {
  createAdminNotice,
  getAdminNotice,
  updateAdminNotice,
} from "@/services/admin/notices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function NoticeWritePage({ mode }: { mode: "write" | "edit" }) {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const editing = mode === "edit";
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "notices", id],
    queryFn: () => getAdminNotice(id),
    enabled: editing && Boolean(id),
  });
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("NOTICE");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setTag(data.tag);
    setBody(data.body);
    setPinned(data.pinned);
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = { title, tag, body, pinned };
      return editing ? updateAdminNotice(id, payload) : createAdminNotice(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      router.replace("/admin/boards/notice");
    },
  });

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>{editing ? "공지 수정" : "공지 등록"}</h1>
        </div>
        <form
          className="admin-form admin-section-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) {
              alert("제목과 본문을 입력해 주세요.");
              return;
            }
            save.mutate();
          }}
        >
          <label>
            구분
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="NOTICE" />
          </label>
          <label>
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
          </label>
          <label>
            본문
            <textarea
              className="is-tall"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="공지 내용"
            />
          </label>
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            상단 고정
          </label>
          <div className="admin-form__actions">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => router.push("/admin/boards/notice")}
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
