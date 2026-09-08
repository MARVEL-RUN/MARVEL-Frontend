import { nextId, readStore, todayStamp, wait, writeStore } from "@/lib/admin/store";
import type { AdminInquiry } from "@/types/boards";

const KEY = "mr-admin-inquiries";

const SEED: AdminInquiry[] = [
  {
    id: "q-1",
    name: "김영웅",
    title: "웨이스트백 보관은 어디서 하나요?",
    body: "집결 시간에 웨이스트백을 맡기려고 합니다. 보관 장소와 수령 시간을 알려 주세요.",
    date: "2026.09.12",
  },
  {
    id: "q-2",
    name: "이서진",
    title: "티셔츠 사이즈 변경이 가능한가요?",
    body: "신청 후 M에서 L로 바꾸고 싶습니다. 접수 마감 전인가요?",
    date: "2026.09.13",
    answer: "접수 마감 전까지 신청조회에서 문의 주시면 변경을 도와 드립니다. 제작 들어간 이후에는 어렵습니다.",
    answeredAt: "2026.09.13",
  },
  {
    id: "q-3",
    name: "박토르",
    title: "주차는 가능한가요?",
    body: "인제스피디움 현장 주차 가능 여부와 셔틀 운영을 알고 싶습니다.",
    date: "2026.09.14",
  },
];

function load() {
  return readStore<AdminInquiry[]>(KEY, SEED);
}

function save(rows: AdminInquiry[]) {
  writeStore(KEY, rows);
}

export async function listInquiries() {
  await wait();
  return load();
}

export async function getInquiry(id: string) {
  await wait();
  return load().find((row) => row.id === id) ?? null;
}

export async function createInquiry(input: Pick<AdminInquiry, "name" | "title" | "body">) {
  await wait();
  const row: AdminInquiry = {
    id: nextId("q"),
    name: input.name.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    date: todayStamp(),
  };
  save([row, ...load()]);
  return row;
}

export async function answerInquiry(id: string, answer: string) {
  await wait();
  const rows = load().map((row) =>
    row.id === id
      ? { ...row, answer: answer.trim(), answeredAt: todayStamp() }
      : row,
  );
  save(rows);
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteInquiry(id: string) {
  await wait();
  save(load().filter((row) => row.id !== id));
}

export async function deleteAnswer(id: string) {
  await wait();
  const rows = load().map((row) => {
    if (row.id !== id) return row;
    const next = { ...row };
    delete next.answer;
    delete next.answeredAt;
    return next;
  });
  save(rows);
}
