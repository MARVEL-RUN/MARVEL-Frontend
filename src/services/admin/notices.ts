import { EVENT } from "@/lib/event";
import { nextId, readStore, todayStamp, wait, writeStore } from "@/lib/admin/store";
import { isNoticeCategory } from "@/lib/admin/noticeCategories";
import type { AdminNotice } from "@/types/admin";

const KEY = "mr-admin-notices";

const TAG_MAP: Record<string, string> = {
  NOTICE: "공지",
  RACE: "이벤트",
  ENTRY: "일반",
};

const SEED: AdminNotice[] = EVENT.notices.map((item) => ({ ...item }));

function normalizeTag(tag: string) {
  if (isNoticeCategory(tag)) return tag;
  return TAG_MAP[tag] ?? "공지";
}

function load() {
  const rows = readStore<AdminNotice[]>(KEY, SEED).map((row) => ({
    ...row,
    tag: normalizeTag(row.tag),
  }));
  writeStore(KEY, rows);
  return rows;
}

function save(rows: AdminNotice[]) {
  writeStore(KEY, rows);
}

export async function listAdminNotices() {
  await wait();
  return load();
}

export async function getAdminNotice(id: string) {
  await wait();
  return load().find((row) => row.id === id) ?? null;
}

export async function createAdminNotice(
  input: Pick<AdminNotice, "title" | "tag" | "body" | "pinned">,
) {
  await wait();
  const row: AdminNotice = {
    id: nextId("n"),
    date: todayStamp(),
    ...input,
    title: input.title.trim(),
    tag: input.tag.trim() || "공지",
    body: input.body.trim(),
  };
  save([row, ...load()]);
  return row;
}

export async function updateAdminNotice(
  id: string,
  input: Pick<AdminNotice, "title" | "tag" | "body" | "pinned">,
) {
  await wait();
  const rows = load().map((row) =>
    row.id === id
      ? {
          ...row,
          title: input.title.trim(),
          tag: input.tag.trim() || "공지",
          body: input.body.trim(),
          pinned: input.pinned,
        }
      : row,
  );
  save(rows);
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteAdminNotice(id: string) {
  await wait();
  save(load().filter((row) => row.id !== id));
}
