import { nextId, readStore, wait, writeStore } from "@/lib/admin/store";
import type { AdminPopup } from "@/types/popup";

const KEY = "mr-admin-popups";

const SEED: AdminPopup[] = [
  {
    id: "p-1",
    url: "https://marvelrun.kr",
    startAt: "2026-09-01T00:00",
    endAt: "2026-12-31T23:59",
    device: "BOTH",
    orderNo: 1,
    imageUrl: "/images/coming-soon/marvel-run-logo.png",
    visible: true,
  },
  {
    id: "p-2",
    url: "/register",
    startAt: "2026-09-10T00:00",
    endAt: "2026-10-31T23:59",
    device: "MOBILE",
    orderNo: 2,
    imageUrl: "/images/main/sidebanner.svg",
    visible: true,
  },
];

function load() {
  return readStore<AdminPopup[]>(KEY, SEED);
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
  const next = rows.map((row, index) => ({
    ...row,
    orderNo: index + 1,
    draft: false,
    id: row.draft ? nextId("p") : row.id,
  }));
  save(next);
  return next;
}
