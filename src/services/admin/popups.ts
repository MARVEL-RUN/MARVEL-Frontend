import { nextId, readStore, wait, writeStore } from "@/lib/admin/store";
import type { AdminPopup } from "@/types/popup";

const KEY = "mr-admin-popups-v2";

const SEED: AdminPopup[] = [
  {
    id: "p-1",
    url: "https://marvelrun.kr",
    startAt: "2026-09-01T00:00",
    endAt: "2026-12-31T23:59",
    device: "BOTH",
    orderNo: 1,
    imageUrl: "/images/coming-soon/marvel-run-logo.png",
    imageName: "marvel-run-logo.png",
  },
  {
    id: "p-2",
    url: "/register",
    startAt: "2026-09-10T00:00",
    endAt: "2026-10-31T23:59",
    device: "MOBILE",
    orderNo: 2,
    imageUrl: "/images/main/sidebanner.svg",
    imageName: "sidebanner.svg",
  },
];

function ensureUniqueIds(rows: AdminPopup[]) {
  const seen = new Set<string>();
  let changed = false;
  const next = rows.map((row, index) => {
    let id = row.id;
    if (!id || seen.has(id)) {
      id = nextId("p");
      changed = true;
    }
    seen.add(id);
    return {
      ...row,
      id,
      orderNo: index + 1,
      draft: false,
    };
  });
  return { rows: next, changed };
}

function load() {
  const raw = readStore<AdminPopup[]>(KEY, SEED);
  const { rows, changed } = ensureUniqueIds(raw);
  if (changed) writeStore(KEY, rows);
  return rows;
}

function save(rows: AdminPopup[]) {
  writeStore(KEY, rows);
}

export async function listPopups() {
  await wait();
  return load().slice().sort((a, b) => a.orderNo - b.orderNo);
}

export async function savePopups(rows: AdminPopup[]) {
  await wait();
  const prepared = rows.map((row, index) => ({
    ...row,
    orderNo: index + 1,
    draft: false,
    id: row.draft || !row.id ? nextId("p") : row.id,
  }));
  const { rows: unique } = ensureUniqueIds(prepared);
  save(unique);
  return unique;
}
