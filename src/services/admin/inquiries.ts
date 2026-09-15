import { nextId, nowStamp, readStore, wait, writeStore } from "@/lib/admin/store";
import type { AdminInquiry } from "@/types/boards";

const KEY = "mr-admin-inquiries-v4";

/** 메인 목록·잠긴 상세에 보이는 제목 */
export const INQUIRY_PUBLIC_TITLE = "[문의]";

const SEED: AdminInquiry[] = [
  {
    id: "q-1",
    name: "김영웅",
    title: "웨이스트백 보관은 어디서 하나요?",
    body: "집결 시간에 웨이스트백을 맡기려고 합니다. 보관 장소와 수령 시간을 알려 주세요.",
    date: "2026.09.12 10:24",
    password: "1234",
  },
  {
    id: "q-2",
    name: "이서진",
    title: "티셔츠 사이즈 변경이 가능한가요?",
    body: "신청 후 M에서 L로 바꾸고 싶습니다. 접수 마감 전인가요?",
    date: "2026.09.13 15:08",
    password: "1234",
    answer: "접수 마감 전까지 신청조회에서 문의 주시면 변경을 도와 드립니다. 제작 들어간 이후에는 어렵습니다.",
    answeredAt: "2026.09.13 16:42",
    attachments: [
      { id: "a-1", name: "신청확인서.pdf", size: 245760 },
      { id: "a-2", name: "사이즈표.png", size: 102400 },
    ],
  },
  {
    id: "q-3",
    name: "박토르",
    title: "주차는 가능한가요?",
    body: "인제스피디움 현장 주차 가능 여부와 셔틀 운영을 알고 싶습니다.",
    date: "2026.09.14 11:36",
    password: "1234",
  },
];

function load() {
  return readStore<AdminInquiry[]>(KEY, SEED);
}

function save(rows: AdminInquiry[]) {
  writeStore(KEY, rows);
}

function withoutPassword(row: AdminInquiry): AdminInquiry {
  return { ...row, password: "" };
}

export async function listInquiries() {
  await wait();
  return load().map(withoutPassword);
}

export async function getInquiry(id: string) {
  await wait();
  const row = load().find((item) => item.id === id);
  return row ? withoutPassword(row) : null;
}

export async function createInquiry(
  input: Pick<AdminInquiry, "name" | "title" | "body" | "password"> & {
    attachments?: AdminInquiry["attachments"];
  },
) {
  await wait();
  const password = input.password.trim();
  if (password.length < 4) {
    throw new Error("비밀번호는 4자 이상이어야 합니다.");
  }
  const row: AdminInquiry = {
    id: nextId("q"),
    name: input.name.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    date: nowStamp(),
    password,
    attachments: input.attachments?.length ? input.attachments : undefined,
  };
  save([row, ...load()]);
  return withoutPassword(row);
}

export async function updateInquiry(
  id: string,
  input: Pick<AdminInquiry, "name" | "title" | "body"> & {
    attachments?: AdminInquiry["attachments"];
    password?: string;
  },
) {
  await wait();
  const rows = load();
  const idx = rows.findIndex((row) => row.id === id);
  if (idx < 0) throw new Error("문의를 찾을 수 없습니다.");

  const nextPassword = input.password?.trim();
  if (nextPassword !== undefined && nextPassword.length > 0 && nextPassword.length < 4) {
    throw new Error("비밀번호는 4자 이상이어야 합니다.");
  }

  const prev = rows[idx];
  const row: AdminInquiry = {
    ...prev,
    name: input.name.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    password: nextPassword || prev.password,
    attachments: input.attachments?.length ? input.attachments : undefined,
  };
  if (!row.attachments) delete row.attachments;

  const next = [...rows];
  next[idx] = row;
  save(next);
  return withoutPassword(row);
}

export async function verifyInquiryPassword(id: string, _password: string) {
  await wait();
  // 임시: 비밀번호 검증 생략 — 글만 있으면 통과
  return load().some((item) => item.id === id);
}

export async function answerInquiry(id: string, answer: string) {
  await wait();
  const rows = load().map((row) =>
    row.id === id
      ? { ...row, answer: answer.trim(), answeredAt: nowStamp() }
      : row,
  );
  save(rows);
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteInquiry(id: string) {
  await wait();
  save(load().filter((row) => row.id !== id));
}

export async function resetInquiryPassword(id: string, password: string) {
  await wait();
  const next = password.trim();
  if (next.length < 4) {
    throw new Error("비밀번호는 4자 이상이어야 합니다.");
  }
  const rows = load();
  if (!rows.some((row) => row.id === id)) {
    throw new Error("문의를 찾을 수 없습니다.");
  }
  save(rows.map((row) => (row.id === id ? { ...row, password: next } : row)));
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
