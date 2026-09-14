import { isFaqCategory, type FaqCategory } from "@/lib/admin/faqCategories";
import { nextId, readStore, todayStamp, wait, writeStore } from "@/lib/admin/store";
import type { AdminFaq } from "@/types/boards";

const KEY = "mr-admin-faqs";

const SEED: AdminFaq[] = [
  {
    id: "faq-1",
    category: "참가 신청",
    question: "참가 접수는 언제 시작하나요?",
    answer:
      "2026년 9월 22일 화요일 오후 2시에 공식 홈페이지에서 접수를 시작합니다. 코스별 정원이 있으며 선착순입니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-2",
    category: "참가 신청",
    question: "단체 신청은 몇 명까지 가능한가요?",
    answer: "단체 신청은 최대 20명까지 한 번에 접수할 수 있습니다. 대표자가 일괄 결제합니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-3",
    category: "참가 신청",
    question: "신청 내역은 어디서 확인하나요?",
    answer: "홈페이지 신청조회에서 이름, 생년월일, 주문번호로 개인 접수를 확인할 수 있습니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-4",
    category: "결제",
    question: "참가비는 어떻게 결제하나요?",
    answer: "접수 시 온라인으로 결제합니다. 결제가 끝나면 주문번호가 발급됩니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-5",
    category: "행사 운영",
    question: "코스별 스타트 타임은 어떻게 되나요?",
    answer: "10 Km 13:30, 5 Km 14:00, 2.3 Km 14:30. 스타트 30분 전까지 집결을 완료해 주세요.",
    date: "2026.09.10",
  },
  {
    id: "faq-6",
    category: "행사 운영",
    question: "우천 시에도 대회가 진행되나요?",
    answer:
      "우천 시에도 대회는 진행됩니다. 기상 특보 등 안전에 문제가 있으면 홈페이지와 문자로 안내합니다.",
    date: "2026.09.10",
  },
  {
    id: "faq-7",
    category: "기타",
    question: "기념품은 언제 받을 수 있나요?",
    answer: "기념품은 대회 당일 지정 부스에서 배번과 함께 수령합니다.",
    date: "2026.09.10",
  },
];

function normalize(row: AdminFaq): AdminFaq {
  return {
    ...row,
    category: isFaqCategory(row.category) ? row.category : "참가 신청",
  };
}

function load() {
  const stored = readStore<AdminFaq[]>(KEY, SEED).map(normalize);
  const have = new Set(stored.map((row) => row.id));
  const extra = SEED.filter((row) => !have.has(row.id)).map(normalize);
  const rows = extra.length ? [...stored, ...extra] : stored;
  writeStore(KEY, rows);
  return rows;
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

export async function createFaq(
  input: Pick<AdminFaq, "category" | "question" | "answer">,
) {
  await wait();
  const row: AdminFaq = {
    id: nextId("faq"),
    date: todayStamp(),
    category: input.category,
    question: input.question.trim(),
    answer: input.answer.trim(),
  };
  save([row, ...load()]);
  return row;
}

export async function updateFaq(
  id: string,
  input: Pick<AdminFaq, "category" | "question" | "answer">,
) {
  await wait();
  const rows = load().map((row) =>
    row.id === id
      ? {
          ...row,
          category: input.category,
          question: input.question.trim(),
          answer: input.answer.trim(),
        }
      : row,
  );
  save(rows);
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteFaq(id: string) {
  await wait();
  save(load().filter((row) => row.id !== id));
}
