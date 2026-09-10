"use client";

import { AdminAttachFiles, type AdminAttachFile } from "@/components/admin/AttachFiles";
import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import {
  isNoticeCategory,
  NOTICE_CATEGORY_OPTIONS,
  type NoticeCategory,
} from "@/lib/admin/noticeCategories";
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
  const [tag, setTag] = useState<NoticeCategory>("공지");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [files, setFiles] = useState<AdminAttachFile[]>([]);

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setTag(isNoticeCategory(data.tag) ? data.tag : "공지");
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
      adminToast.success(editing ? "공지가 수정되었습니다." : "공지가 등록되었습니다.");
      router.replace("/admin/boards/notice");
    },
    onError: () => {
      adminToast.error(editing ? "공지 수정에 실패했습니다." : "공지 등록에 실패했습니다.");
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
          <div className="admin-form__row">
            <label className="admin-form__category">
              카테고리
              <AdminSelect
                value={tag}
                options={NOTICE_CATEGORY_OPTIONS}
                onChange={setTag}
                ariaLabel="카테고리"
                width={140}
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
          </div>
          <label>
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
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
          <AdminAttachFiles files={files} onChange={setFiles} />
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
