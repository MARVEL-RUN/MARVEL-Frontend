"use client";

import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import { AdminHttpError } from "@/lib/admin/fetch";
import { isNoticeCategoryName } from "@/lib/noticeCategories";
import {
  createAdminNotice,
  getAdminNotice,
  listAdminNoticeCategories,
  updateAdminNotice,
} from "@/services/admin/boards/notices";
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
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "notice-categories"],
    queryFn: listAdminNoticeCategories,
  });
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setCategoryId(data.noticeCategoryId);
    setBody(data.content);
  }, [data]);

  useEffect(() => {
    if (categoryId) return;
    const fallback =
      categories.find((row) => row.name === "공지") ??
      categories.find((row) => isNoticeCategoryName(row.name));
    if (fallback) setCategoryId(fallback.id);
  }, [categories, categoryId]);

  const categoryOptions = categories
    .filter((row) => isNoticeCategoryName(row.name) || row.id === categoryId)
    .map((row) => ({
      value: row.id,
      label: row.name,
    }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        content: body.trim(),
        categoryId,
      };
      if (editing) {
        await updateAdminNotice(id, payload);
        return;
      }
      await createAdminNotice(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      adminToast.success(editing ? "공지가 수정되었습니다." : "공지가 등록되었습니다.");
      router.replace("/admin/boards/notice");
    },
    onError: (err) => {
      const fallback = editing ? "공지 수정에 실패했습니다." : "공지 등록에 실패했습니다.";
      adminToast.error(err instanceof AdminHttpError ? err.message : fallback);
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
            if (!categoryId) {
              alert("카테고리를 선택해 주세요.");
              return;
            }
            save.mutate();
          }}
        >
          <div className="admin-form__row">
            <label className="admin-form__category">
              카테고리
              <AdminSelect
                value={categoryId || categoryOptions[0]?.value || ""}
                options={
                  categoryOptions.length
                    ? categoryOptions
                    : [{ value: "", label: "불러오는 중..." }]
                }
                onChange={setCategoryId}
                ariaLabel="카테고리"
                width={140}
              />
            </label>
            <p className="admin-form__hint">필독을 선택하면 목록 상단에 고정됩니다.</p>
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
