import { RUNNING_CERT_MIN_KM, RUNNING_CERT_PERIOD_LABEL } from "./running-cert";

export type VirtualRunGuideRow = { label: string; value: string };

export type VirtualRunGuideField = { label: string; required: boolean; rule: string };

export const VIRTUAL_RUN_GUIDE_FLOW = [
  { code: "KIT", title: "키트 수령", desc: "배송 시작 시 송장번호를 문자로 보내드립니다." },
  { code: "RUN", title: `하루 안 ${RUNNING_CERT_MIN_KM}km`, desc: "앱·워치·트레드밀 무엇이든 기록이 남으면 됩니다." },
  { code: "POST", title: "인스타 게시", desc: "기록 화면과 인증샷을 필수 해시태그와 함께 올립니다." },
  { code: "SUBMIT", title: "마이페이지 제출", desc: "기록·스크린샷·게시물 링크를 입력하면 바로 검증합니다." },
] as const;

export const VIRTUAL_RUN_GUIDE_COMMON: VirtualRunGuideRow[] = [
  { label: "인증 기간", value: RUNNING_CERT_PERIOD_LABEL },
  { label: "이미지", value: "JPG·PNG·HEIC, 장당 10MB 이하" },
  { label: "결과 안내", value: "자동 승인은 제출 즉시, 검수는 48시간 이내" },
  { label: "수정·재제출", value: "검수 전까지 수정 가능, 반려 후 회차당 2회까지 재제출" },
  { label: "인스타 게시물", value: "인증 기간 동안 공개 상태 유지" },
];

export const VIRTUAL_RUN_RUNNING_RULES: VirtualRunGuideRow[] = [
  { label: "완주 조건", value: `하루 안 ${RUNNING_CERT_MIN_KM}.00km 이상 · 실외·트레드밀·걷기 모두 인정` },
  { label: "인증 횟수", value: "회차당 1회 승인" },
  { label: "달린 날짜", value: `${RUNNING_CERT_PERIOD_LABEL} 안, 오늘 이후 날짜 불가` },
  { label: "기록 도구", value: "러닝 앱 · 스마트워치 · 트레드밀 · 기타" },
];

export const VIRTUAL_RUN_RUNNING_FIELDS: VirtualRunGuideField[] = [
  { label: "회차", required: true, rule: "구매한 회차 중 아직 인증하지 않은 회차" },
  { label: "날짜·거리·시간", required: true, rule: "기록 화면과 같은 값으로 입력, 페이스는 자동 계산" },
  { label: "기록 스크린샷", required: true, rule: "거리·시간·날짜가 한 화면에 보이게, 트레드밀은 계기판 사진" },
  { label: "인증샷", required: false, rule: "배번호나 피니시 라인이 보이면 좋습니다" },
  { label: "인스타 스크린샷·링크", required: true, rule: "필수 해시태그가 보이는 게시물, instagram.com/p/ 또는 /reel/ 주소" },
  { label: "허위 제출 서약", required: true, rule: "허위로 확인되면 리워드를 회수합니다" },
];

export const VIRTUAL_RUN_RUNNING_AUTO: VirtualRunGuideRow[] = [
  { label: "거리", value: "기록 화면 5.00km 이상, 입력값과 ±0.05km" },
  { label: "시간", value: "입력값과 ±30초" },
  { label: "날짜", value: "기록 화면 날짜와 입력 날짜 일치 (날짜가 안 보이면 검수)" },
  { label: "페이스", value: "2:30/km ~ 20:00/km 범위 밖이면 검수" },
];

export const VIRTUAL_RUN_KIT_FIELDS: VirtualRunGuideField[] = [
  { label: "키트 사진", required: true, rule: "1~3장, 본인 배번호가 선명하게 보이게" },
  { label: "인스타 스크린샷·링크", required: true, rule: "러닝 인증과 다른 게시물" },
  { label: "홍보 활용 동의", required: false, rule: "공식 채널 리그램 대상" },
];

export const VIRTUAL_RUN_REVIEW_REASONS = [
  "키트 사진 배번호가 본인 배번호와 다를 때",
  "다른 참가자·다른 회차와 같은 이미지나 게시물 링크일 때",
  "편집·합성이 의심될 때",
] as const;

export type VirtualRunFaqCategory = "ticket" | "cert" | "reward";

export type VirtualRunFaq = { category: VirtualRunFaqCategory; q: string; a: string };

export const VIRTUAL_RUN_FAQ_TABS: { id: "all" | VirtualRunFaqCategory; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "ticket", label: "티켓·배송" },
  { id: "cert", label: "인증" },
  { id: "reward", label: "리워드" },
];

export const VIRTUAL_RUN_FAQS: VirtualRunFaq[] = [
  {
    category: "ticket",
    q: "1회차 티켓과 3회차 패키지는 무엇이 다른가요?",
    a: "1회차 티켓은 고른 회차의 키트 1세트, 3회차 패키지는 어벤져스·엑스맨·판타스틱4 키트 3세트를 받습니다. 인증도 구매한 회차만 할 수 있습니다.",
  },
  {
    category: "ticket",
    q: "회원가입이 필요한가요?",
    a: "필요 없습니다. 결제 후 문자로 받은 배번호와 휴대폰 번호로 마이페이지에 로그인합니다.",
  },
  {
    category: "ticket",
    q: "키트는 언제 받나요?",
    a: "11월 30일부터 순차 배송합니다. 배송이 시작되면 송장번호를 문자로 보내드리고, 마이페이지 키트 카드에서도 확인할 수 있습니다.",
  },
  {
    category: "cert",
    q: "5km를 나눠서 달려도 되나요?",
    a: "같은 날 안에 기록된 5.00km 이상이면 됩니다. 실외·트레드밀·걷기 모두 인정합니다.",
  },
  {
    category: "cert",
    q: "기록 스크린샷에 날짜가 안 보여요.",
    a: "제출은 가능하지만 자동 승인 대신 운영진 검수로 넘어갑니다. 결과는 48시간 안에 알려 드립니다.",
  },
  {
    category: "cert",
    q: "반려되면 다시 낼 수 있나요?",
    a: "반려 사유를 확인한 뒤 회차당 2번까지 다시 제출할 수 있습니다. 검수 전이라면 제출한 내용을 수정할 수 있습니다.",
  },
  {
    category: "cert",
    q: "인스타 계정이 비공개여도 되나요?",
    a: "게시물 확인이 필요해 인증 기간 동안은 공개 상태를 유지해 주세요.",
  },
  {
    category: "reward",
    q: "기프티콘은 언제 오나요?",
    a: "러닝 인증이 승인되면 바로 문자로 발송합니다. 받지 못했다면 마이페이지 리워드 내역에서 재발송을 요청해 주세요.",
  },
  {
    category: "reward",
    q: "완주증은 어디서 받나요?",
    a: "승인된 회차는 마이페이지 참가 개요에서 이름·배번호·기록이 담긴 완주증을 내려받을 수 있습니다.",
  },
];
