import { nextId, readStore, todayStamp, wait, writeStore } from "@/lib/admin/store";
import type { AdminFaq } from "@/types/boards";

const KEY = "mr-admin-faqs";

const SEED: AdminFaq[] = [
  {
    id: "faq-1",
    question: "참가 접수는 언제 시작하나요?",
    answer:
      "2026년 9월 22일 화요일 오후 2시에 공식 홈페이지에서 접수를 시작합니다. 코스별 정원이 있으며 선착순입니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-2",
    question: "단체 신청은 몇 명까지 가능한가요?",
    answer: "단체 신청은 최대 20명까지 한 번에 접수할 수 있습니다. 대표자가 일괄 결제합니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-3",
    question: "신청 내역은 어디서 확인하나요?",
    answer: "홈페이지 신청조회에서 이름, 생년월일, 주문번호로 개인 접수를 확인할 수 있습니다.",
    date: "2026.09.10",
  },
];

function load() {
  return readStore<AdminFaq[]>(KEY, SEED);
}

function save(rows: AdminFaq[]) {
  writeStore(KEY, rows);
}

export async function listFaqs() {
  await wait();
  return load();
}

export async function getFaq(id: string) {
  await wait();
  return load().find((row) => row.id === id) ?? null;
}

export async function createFaq(input: Pick<AdminFaq, "question" | "answer">) {
  await wait();
  const row: AdminFaq = {
    id: nextId("faq"),
    question: input.question.trim(),
    answer: input.answer.trim(),
    date: todayStamp(),
  };
  save([row, ...load()]);
  return row;
}

export async function updateFaq(id: string, input: Pick<AdminFaq, "question" | "answer">) {
  await wait();
  const rows = load().map((row) =>
    row.id === id
      ? { ...row, question: input.question.trim(), answer: input.answer.trim() }
      : row,
  );
  save(rows);
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteFaq(id: string) {
  await wait();
  save(load().filter((row) => row.id !== id));
}
