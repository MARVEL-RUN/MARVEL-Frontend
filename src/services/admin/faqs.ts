import { isFaqCategory } from "@/lib/admin/faqCategories";
import { nextId, readStore, todayStamp, wait, writeStore } from "@/lib/admin/store";
import type { AdminFaq } from "@/types/admin/boards";

const KEY = "mr-admin-faqs-v3";

const SEED: AdminFaq[] = [
  {
    id: "faq-1",
    category: "참가 신청",
    question: "MARVEL RUN 2026 참가 신청은 어떻게 하나요?",
    answer: [
      "MARVEL RUN 2026 홈페이지 접속 > 신청하기 클릭 > 약관 동의 > 참가 코스 및 티셔츠 사이즈 선택 > 참가자 정보 입력 > 참가비 결제",
      "참가 신청에 필요한 필수 약관 및 개인정보 처리 관련 사항에 동의한 경우에만 신청할 수 있습니다.",
      "",
      "[접수 일정 안내]",
      "9월 22일(화) 오후 2시부터 접수 시작",
      "* 결제자 기준 선착순 마감이라는 점 참고 부탁드립니다.",
      "* 결제완료 후 티셔츠 사이즈 변경 등 정보 수정이 어려우니, 신중히 결제해 주시기 바랍니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-2",
    category: "참가 신청",
    question: "단체 신청은 어떻게 하나요?",
    answer: [
      "단체 접수는 적법한 권한을 갖고 관련 사항을 위임 받은 단체 대표자가 참가자들의 인적사항을 취합하여 일괄 신청하는 방식으로 진행됩니다.",
      "* 추가 참가자의 인적사항을 단체 대표자에게 전달하여 신청",
      "※ 개별 신청 후 단체 소속 변경을 요청하실 경우, 참가자 성명과 연락처, 소속 단체명을 확인할 수 있도록 준비해 주세요.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-3",
    category: "참가 신청",
    question: "참가 신청 제한이 있나요?",
    answer: [
      "남녀노소, 내국인, 외국인 등 누구나 참여 가능합니다.",
      "* 대회일인 2026년 10월 31일 기준 만 14세 미만인 참가자(2012년 11월 1일 출생자부터 그 이후 출생자까지)의 경우 법정 대리인 동의가 반드시 필요합니다.",
      "* 대회일인 2026년 10월 31일 기준 만 12세 이하인 참가자(2013년 11월 1일 출생자부터 그 이후 출생자까지)는 보호자가 별도로 참가 신청을 완료한 후, 동일 코스에 동반 참가해야 합니다.",
      "※ 위 사항이 지켜지지 않을 시 마블런 참가에 제한이 있음을 알려드립니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-4",
    category: "행사 운영",
    question: "유아차(유모차)를 끌고 참가할 수 있나요?",
    answer: [
      "참가자의 안전과 원활한 코스 운영을 위하여 유아차(유모차)를 이용한 레이스 참가는 불가합니다.",
      "양해 부탁드립니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-5",
    category: "참가 신청",
    question: "사이트 회원가입이 필요한가요?",
    answer: "마블런 2026은 사이트 회원가입 없이 참가 신청/결제가 가능합니다.",
    date: "2026.09.16",
  },
  {
    id: "faq-6",
    category: "결제",
    question: "참가비 결제는 어떻게 하나요?",
    answer: [
      "참가비 결제는 카드결제를 통해서만 가능합니다. 참가 신청 후 이어서 결제가 가능합니다.",
      "<마블런 2026 인제스피디움>",
      "본 접수 신청 : 2026년 9월 22일(화) 오후 2시부터",
      "<마블런 버추얼런>",
      "추후 공지 예정입니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-7",
    category: "결제",
    question: "참가 취소 및 환불은 어떻게 하나요?",
    answer: [
      "참가비 환불은 홈페이지에서 환불신청이 가능합니다.",
      "참가신청 조회 > 환불신청",
      "",
      "* 본 접수 환불 신청 마감 : 10월 12일(월) 17시",
      "※ 환불 신청 마감 이후에는 참가 취소, 환불, 코스 및 티셔츠 사이즈 변경이 불가합니다.",
      "",
      "* 버추얼런 환불 신청기간 : 추후 공지 예정입니다.",
      "※ 환불액 지급기간 : 환불 완료 처리 후 카드사에 따라 영업일 기준 일주일 내외로 소요",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-8",
    category: "참가 신청",
    question: "참가권 양도 또는 대리 참가가 가능한가요?",
    answer: [
      "마블런 2026은 건전한 참가 문화 조성과 부정 재판매 방지를 위해 참가권 양도를 금지하고 있습니다.",
      "이에 따라 참가권은 신청자 본인에 한하여 사용할 수 있으며, 타인에게 양도·판매하거나 대리 참가하는 행위는 허용되지 않습니다.",
      "참가권의 임의 양도로 인해 발생하는 문제 및 피해에 대해서는 사무국이 책임지지 않으며, 실제 참가자와 보험 가입자(신청자)가 다른 경우 대회 중 발생한 사고에 대해 보험 적용 및 보상이 제한될 수 있습니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-9",
    category: "참가 신청",
    question: "코스 변경 및 개인정보 수정이 가능한가요?",
    answer: [
      "환불 신청 마감 전 코스 또는 티셔츠 사이즈 변경을 원하시는 경우, 기존 신청을 취소한 후 다시 신청해 주셔야 합니다.",
      "마블런은 선착순으로 접수되므로 재신청 시점의 코스별 잔여 인원 및 티셔츠 재고에 따라 선택 가능한 항목이 달라질 수 있습니다. 기존 신청을 취소하기 전에 홈페이지에서 접수 현황을 확인해 주시기 바랍니다.",
      "배송지 주소는 환불 신청 마감 전까지 사무국을 통해 변경을 요청할 수 있으며, 환불 신청 마감 이후에는 변경이 제한될 수 있습니다.",
      "환불 신청 마감 이후에는 코스 및 티셔츠 사이즈를 변경할 수 없습니다.",
      "※ 결제 완료 후 일부 참가정보는 직접 수정할 수 없으므로 신청 전에 입력 내용을 확인해 주시기 바랍니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-10",
    category: "기념품",
    question: "기념품 수령 방법은 어떻게 되나요?",
    answer: [
      "본 접수 참가자 : 대회 1주일 전 택배 수령",
      "버추얼런 : 추후 공지",
      "입력하신 배송지 정보는 신청확인에서 확인할 수 있으며, 배송지 주소 변경은 환불 가능 기간 내에 한하여 사무국(02-338-0344)을 통해 요청 가능하며, 환불 마감 이후에는 변경이 제한될 수 있습니다.",
      "",
      "※ 해외 배송은 지원하지 않습니다.",
      "※ 배송 완료 이후에는 사이즈 선택 오류 또는 개인정보 오기재에 따른 교환 및 환불이 불가능하오니 신청 시 반드시 정보를 확인해 주시기 바랍니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-11",
    category: "행사 운영",
    question: "물품보관소는 어떻게 운영되나요?",
    answer: [
      "물품보관소는 본 대회에서만 운영되며, 10/31(토) 11:00 ~ 18:00까지 운영됩니다.",
      "원활한 운영과 현장 혼합 방지를 위해 개인 소지품은 최소한으로 지참해 주시기 바랍니다.",
      "보관 물품은 운영 시간 내 반드시 찾아가 주셔야 하며, 오후 6시 이후 미수령 물품은 운영 사무국으로 인계됩니다.",
      "※ 귀중품은 가급적 지참하지 않거나 참가자 본인이 직접 보관해 주시기 바랍니다.",
      "※ 개인의 부주의로 발생한 귀중품 및 소지품의 분실·도난·파손에 대해서는 이에 대한 사무국의 고의나 중과실이 없는 한 사무국이 책임지기 어려운 점 양해 부탁드립니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-12",
    category: "행사 운영",
    question: "기록측정은 어떻게 하나요?",
    answer: [
      "5km, 10km 부문의 경우 기록칩을 활용하여 개인별 완주 기록을 측정합니다.",
      "정확한 기록 측정을 위해 배번호에 부착된 기록칩을 훼손하거나 임의로 분리하지 말고 착용한 상태로 참가해 주시기 바랍니다.",
      "※ 2.3km 부문의 경우 별도 기록 측정을 진행하지 않습니다.",
      "※ 기록칩은 참가자 1인당 1개만 지급되며, 분실 또는 훼손 시 재발급이 불가합니다.",
      "※ 기록은 출발지점을 통과한 시점부터 측정되는 넷타임(Net-time) 방식으로 계측됩니다.",
      "※ 기록칩은 일회용으로, 대회 종료 후 별도 반납하지 않으셔도 됩니다.",
      "※ 참가 패키지 수령 후 배번호표 뒷면에 기록칩이 정상적으로 부착되어 있는지 반드시 확인해 주세요.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-13",
    category: "행사 운영",
    question: "버추얼런 인증은 어떻게 하나요?",
    answer: "추후 공지 예정입니다.",
    date: "2026.09.16",
  },
  {
    id: "faq-14",
    category: "행사 운영",
    question: "우천 시 행사를 진행하나요?",
    answer: [
      "우천시에도 대회는 정상적으로 진행될 예정입니다.",
      "대회 당일에 비 예보가 있거나 비가 올 경우에 대비하여 개인용 우비를 준비해 주시기 바랍니다.",
      "단, 천재지변이나 자연재해(태풍, 폭우, 폭설, 강풍, 미세먼지 등) 발생 시 행사 중지 또는 취소될 수 있으며, 관련 법령이 허용하는 한도 내에서 이 경우 참가비의 환불이 제한됩니다.",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-15",
    category: "보험",
    question: "참가자 보험 가입 및 보상범위는 어떻게 되나요?",
    answer: [
      "사무국은 부상, 사고 등을 대비하여 참가자를 위해 보험에 가입합니다.",
      "사무국은 행사 중 발생한 부상, 사고 등에 있어 보험에 가입된 한도 내에서 보험사가 부담하며, 사무국의 고의나 중과실이 개입하지 않은 참가자의 과실이나 부주의에 의한 사고, 부상 등은 응급조치(현장조치 후 병원 후송까지) 이외의 책임을 지지 않습니다.",
      "",
      "주최자배상책임보험 조건",
      "| 담보명 | 보상금액(인당/사고당) |",
      "| 대인 | 150,000,000원(인당) / 300,000,000원(사고당) |",
      "| 대물 | 10,000,000원(사고당) |",
      "| 구내치료비 | 1,000,000원(인당) / 5,000,000원(사고당) |",
      "*치료비는 영수금액",
    ].join("\n"),
    date: "2026.09.16",
  },
  {
    id: "faq-16",
    category: "기념품",
    question: "참가자 기념품 및 수령방법은 어떻게 되나요?",
    answer: [
      "기념품은 참가신청 시 입력하신 주소로 대회 전 배송됩니다.",
      "- 택배발송 기념품 : 배번호, 티셔츠, 스카프, 각종 협찬 굿즈들 등",
      "- 현장지급 기념품 : 간식, 메달 등",
    ].join("\n"),
    date: "2026.09.16",
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
