"use client";

import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import { adminNoticesHref } from "@/lib/admin/eventLinks";
import { AdminHttpError } from "@/lib/admin/fetch";
import { isNoticeCategoryName } from "@/lib/noticeCategories";
import { fetchAdminEvents } from "@/services/admin/applications";
import {
  createAdminNotice,
  getAdminNotice,
  listAdminNoticeCategories,
  updateAdminNotice,
} from "@/services/admin/boards/notices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TITLE_MAX = 50;

export function NoticeWritePage({ mode }: { mode: "write" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const queryEventId = searchParams.get("eventId")?.trim() ?? "";
  const editing = mode === "edit";
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "notices", id],
    queryFn: () => getAdminNotice(id),
    enabled: editing && Boolean(id),
  });
  const eventId = queryEventId || data?.eventId?.trim() || "";
  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi && Boolean(eventId),
  });
  const eventName =
    eventsQuery.data?.find((event) => event.eventId === eventId)?.eventName ||
    "";
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
    if (editing || queryEventId) return;
    router.replace("/admin/boards/notice");
  }, [editing, queryEventId, router]);

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
      await createAdminNotice(eventId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      adminToast.success(editing ? "공지가 수정되었습니다." : "공지가 등록되었습니다.");
      router.replace(eventId ? adminNoticesHref(eventId) : "/admin/boards/notice");
    },
    onError: (err) => {
      const fallback = editing ? "공지 수정에 실패했습니다." : "공지 등록에 실패했습니다.";
      adminToast.error(err instanceof AdminHttpError ? err.message : fallback);
    },
  });

  if (!editing && !queryEventId) return null;

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
            if (title.trim().length > TITLE_MAX) {
              alert(`제목은 ${TITLE_MAX}자까지입니다.`);
              return;
            }
            if (!editing && !eventId) {
              alert("대회를 선택해 주세요.");
              return;
            }
            if (!categoryId) {
              alert("카테고리를 선택해 주세요.");
              return;
            }
            save.mutate();
          }}
        >
          {eventName || eventId ? (
            <p className="admin-form__hint">대회 · {eventName || eventId}</p>
          ) : null}
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
            <input
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="제목을 입력하세요"
            />
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
              onClick={() =>
                router.push(eventId ? adminNoticesHref(eventId) : "/admin/boards/notice")
              }
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
