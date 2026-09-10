import { EVENT } from "./event";
import type { ConsentId } from "./legal";

export type CourseId = (typeof EVENT.courses)[number]["id"];
export type ShirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL";
export type Gender = "male" | "female" | "none";
export type ApplyKind = "individual" | "group";
export type TicketKind = "adult" | "child";

export type Consents = {
  agreeRules: boolean;
  agreePrivacy: boolean;
  agreeThirdParty: boolean;
  agreeConsign: boolean;
  agreeMarketing: boolean;
};

export const CONSENT_FIELD: Record<ConsentId, keyof Consents> = {
  rules: "agreeRules",
  privacy: "agreePrivacy",
  thirdParty: "agreeThirdParty",
  consign: "agreeConsign",
  marketing: "agreeMarketing",
};

export const EMPTY_CONSENTS: Consents = {
  agreeRules: false,
  agreePrivacy: false,
  agreeThirdParty: false,
  agreeConsign: false,
  agreeMarketing: false,
};

export type EntryDraft = {
  courseId: CourseId | "";
  ticket: TicketKind;
  name: string;
  birth: string;
  gender: Gender | "";
  phone: string;
  email: string;
  emergency: string;
  shirt: ShirtSize | "";
} & Consents;

export type EntryRecord = {
  orderNo: string;
  courseId: CourseId;
  ticket: TicketKind;
  name: string;
  birth: string;
  gender: Gender;
  phone: string;
  email: string;
  emergency: string;
  shirt: ShirtSize;
};

export type ParticipantDraft = {
  courseId: CourseId | "";
  ticket: TicketKind;
  name: string;
  birth: string;
  gender: Gender | "";
  phone: string;
  shirt: ShirtSize | "";
};

export type GroupDraft = {
  courseId: CourseId | "";
  groupName: string;
  leaderName: string;
  phone: string;
  email: string;
  participants: ParticipantDraft[];
} & Consents;

export type SavedParticipant = {
  courseId: CourseId;
  ticket: TicketKind;
  name: string;
  birth: string;
  gender: Gender;
  phone: string;
  shirt: ShirtSize;
};

export type GroupRecord = {
  orderNo: string;
  groupName: string;
  leaderName: string;
  phone: string;
  email: string;
  participants: SavedParticipant[];
};

export type LookupQuery = {
  name: string;
  birth: string;
  orderNo: string;
};

export type GroupLookupQuery = {
  groupName: string;
  leaderName: string;
  orderNo: string;
};

export const MAX_GROUP_SIZE = 20;

export const SHIRT_SIZES: ShirtSize[] = ["XS", "S", "M", "L", "XL", "2XL"];

export const GENDERS: { id: Gender; label: string }[] = [
  { id: "male", label: "남성" },
  { id: "female", label: "여성" },
  { id: "none", label: "선택 안 함" },
];

export const EMPTY_DRAFT: EntryDraft = {
  courseId: "",
  ticket: "adult",
  name: "",
  birth: "",
  gender: "",
  phone: "",
  email: "",
  emergency: "",
  shirt: "",
  ...EMPTY_CONSENTS,
};

export const EMPTY_PARTICIPANT: ParticipantDraft = {
  courseId: "",
  ticket: "adult",
  name: "",
  birth: "",
  gender: "",
  phone: "",
  shirt: "",
};

export const EMPTY_GROUP: GroupDraft = {
  courseId: "",
  groupName: "",
  leaderName: "",
  phone: "",
  email: "",
  participants: [{ ...EMPTY_PARTICIPANT }],
  ...EMPTY_CONSENTS,
};

export function courseById(id: CourseId) {
  return EVENT.courses.find((c) => c.id === id);
}

export function genderLabel(id: Gender) {
  return GENDERS.find((g) => g.id === id)?.label ?? id;
}

export function ticketLabel(kind: TicketKind) {
  return kind === "child" ? "어린이" : "성인";
}

export function courseAllowsChild(
  course: NonNullable<ReturnType<typeof courseById>>,
) {
  return "childFee" in course;
}

function shiftYmd(ymd: string, years: number) {
  return `${Number(ymd.slice(0, 4)) + years}${ymd.slice(4)}`;
}

function nextYmd(ymd: string) {
  const y = Number(ymd.slice(0, 4));
  const m = Number(ymd.slice(4, 6));
  const d = Number(ymd.slice(6, 8));
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}`;
}

export function ymdKo(ymd: string) {
  return `${Number(ymd.slice(0, 4))}년 ${Number(ymd.slice(4, 6))}월 ${Number(ymd.slice(6, 8))}일`;
}

/* 만 N세 미만 = 대회일-N년 다음날 이후 출생(당일 포함) */
export const CHILD_BIRTH_FROM = nextYmd(shiftYmd(EVENT.raceYmd, -13));
export const CHILD_BIRTH_UNTIL = shiftYmd(EVENT.raceYmd, -6);
export const GUARDIAN_BIRTH_FROM = nextYmd(shiftYmd(EVENT.raceYmd, -14));

export const CHILD_AGE_NOTE = `어린이 나이: 만 6세 ~ 만 12세 (${ymdKo(CHILD_BIRTH_FROM)} 이후 출생자)`;
export const GUARDIAN_AGE_NOTE = `법정대리인 동의: 만 14세 미만 (${ymdKo(GUARDIAN_BIRTH_FROM)} 이후 출생자)`;

export type AgeBand = "tooYoung" | "child" | "teen" | "adult";

export function ageBand(birth: string): AgeBand | null {
  if (!/^\d{8}$/.test(birth)) return null;
  if (birth > EVENT.raceYmd) return "tooYoung";
  if (birth > CHILD_BIRTH_UNTIL) return "tooYoung";
  if (birth >= CHILD_BIRTH_FROM) return "child";
  if (birth >= GUARDIAN_BIRTH_FROM) return "teen";
  return "adult";
}

export function ticketForBirth(birth: string): TicketKind {
  return ageBand(birth) === "child" ? "child" : "adult";
}

export function needsGuardian(birth: string) {
  const band = ageBand(birth);
  return band === "child" || band === "teen";
}

export function courseOpenForBirth(
  course: NonNullable<ReturnType<typeof courseById>>,
  birth: string,
) {
  const band = ageBand(birth);
  if (!band) return true;
  if (band === "tooYoung") return false;
  if (band === "child") return courseAllowsChild(course);
  return true;
}

export function applyCourseForBirth(
  courseId: CourseId | "",
  birth: string,
): { courseId: CourseId | ""; ticket: TicketKind } {
  const ticket = ticketForBirth(birth);
  if (!courseId) return { courseId: "", ticket };
  const course = courseById(courseId);
  if (!course || !courseOpenForBirth(course, birth)) {
    return { courseId: "", ticket };
  }
  return {
    courseId,
    ticket: courseAllowsChild(course) ? ticket : "adult",
  };
}

export function courseClosedReason(birth: string) {
  const band = ageBand(birth);
  if (band === "tooYoung") return "만 6세 미만은 참가할 수 없습니다.";
  if (band === "child") return "어린이 참가 불가";
  return "";
}

export function courseNote(
  course: NonNullable<ReturnType<typeof courseById>>,
) {
  if ("childFee" in course) return `어린이 ${course.childFee.replace("원", "")}`;
  return "어린이 참가 불가";
}

export function feeDigits(fee: string) {
  return fee.replace(/원/g, "");
}

export function ticketFee(
  course: NonNullable<ReturnType<typeof courseById>>,
  ticket: TicketKind,
) {
  if (ticket === "child" && "childFee" in course) return course.childFee;
  return course.fee;
}

export function feeAmount(fee: string) {
  return Number(fee.replace(/[^\d]/g, "")) || 0;
}

export function formatFee(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "hanmail.net",
  "nate.com",
  "kakao.com",
  "hotmail.com",
  "icloud.com",
] as const;

export const EMAIL_CUSTOM = "custom";

export function joinEmail(local: string, domain: string) {
  const a = local.trim();
  const b = domain.trim().replace(/^@+/, "");
  if (!a) return "";
  if (!b) return a;
  return `${a}@${b}`;
}

export function splitEmail(email: string) {
  const raw = email.trim();
  const at = raw.indexOf("@");
  if (at < 0) return { local: raw, domain: "" };
  return { local: raw.slice(0, at), domain: raw.slice(at + 1) };
}

export function emailOk(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function groupFee(draft: GroupDraft) {
  return draft.participants.reduce((sum, p) => {
    const course = p.courseId ? courseById(p.courseId) : undefined;
    if (!course) return sum;
    return sum + feeAmount(ticketFee(course, p.ticket));
  }, 0);
}

export function requiredConsentsOk(c: Consents) {
  return c.agreeRules && c.agreePrivacy && c.agreeThirdParty && c.agreeConsign;
}

export function consentsAll(on: boolean): Consents {
  return {
    agreeRules: on,
    agreePrivacy: on,
    agreeThirdParty: on,
    agreeConsign: on,
    agreeMarketing: on,
  };
}

export function consentsCheckedAll(c: Consents) {
  return (
    c.agreePrivacy &&
    c.agreeThirdParty &&
    c.agreeConsign &&
    c.agreeMarketing
  );
}

export function consentValues(c: Consents) {
  return {
    rules: c.agreeRules,
    privacy: c.agreePrivacy,
    thirdParty: c.agreeThirdParty,
    consign: c.agreeConsign,
    marketing: c.agreeMarketing,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertAgeTicket(
  birth: string,
  ticket: TicketKind,
  course: NonNullable<ReturnType<typeof courseById>>,
  prefix = "",
) {
  const band = ageBand(birth);
  if (band === "tooYoung") {
    throw new Error(`${prefix}만 6세 미만은 참가할 수 없습니다.`);
  }
  if (!courseOpenForBirth(course, birth)) {
    throw new Error(`${prefix}이 코스는 어린이 참가가 불가합니다.`);
  }
  const expected = courseAllowsChild(course) ? ticketForBirth(birth) : "adult";
  if (ticket !== expected) {
    throw new Error(
      `${prefix}생년월일에 맞는 종목(${ticketLabel(expected)})을 선택하세요.`,
    );
  }
}

function assertDraft(draft: EntryDraft): asserts draft is EntryDraft & {
  courseId: CourseId;
  gender: Gender;
  shirt: ShirtSize;
} {
  if (!draft.courseId) throw new Error("참가종목을 선택하세요.");
  const picked = courseById(draft.courseId);
  if (!picked) throw new Error("참가종목을 선택하세요.");
  if (!draft.name.trim()) throw new Error("이름을 입력하세요.");
  if (!/^\d{8}$/.test(draft.birth)) throw new Error("생년월일을 선택하세요.");
  assertAgeTicket(draft.birth, draft.ticket, picked);
  if (!draft.gender) throw new Error("성별을 선택하세요.");
  if (!draft.phone.trim()) throw new Error("휴대폰번호를 입력하세요.");
  if (!emailOk(draft.email)) throw new Error("이메일을 입력하세요.");
  if (needsGuardian(draft.birth) && !draft.emergency.trim()) {
    throw new Error("만 14세 미만은 보호자 연락처를 입력하세요.");
  }
  if (!draft.shirt) throw new Error("기념품을 선택하세요.");
  if (!requiredConsentsOk(draft)) {
    throw new Error("필수 약관에 동의해 주세요.");
  }
}

function assertParticipant(
  p: ParticipantDraft,
  i: number,
): asserts p is ParticipantDraft & {
  courseId: CourseId;
  gender: Gender;
  shirt: ShirtSize;
} {
  const n = i + 1;
  const prefix = `참가자 ${n}: `;
  if (!p.courseId) throw new Error(`${prefix}참가종목을 선택하세요.`);
  const picked = courseById(p.courseId);
  if (!picked) throw new Error(`${prefix}참가종목을 선택하세요.`);
  if (!p.name.trim()) throw new Error(`${prefix}이름을 입력하세요.`);
  if (!/^\d{8}$/.test(p.birth)) {
    throw new Error(`${prefix}생년월일을 입력하세요.`);
  }
  assertAgeTicket(p.birth, p.ticket, picked, prefix);
  if (!p.gender) throw new Error(`${prefix}성별을 선택하세요.`);
  if (!p.phone.trim()) throw new Error(`${prefix}연락처를 입력하세요.`);
  if (!p.shirt) throw new Error(`${prefix}기념품을 선택하세요.`);
}

function assertGroup(draft: GroupDraft): asserts draft is GroupDraft & {
  participants: Array<
    ParticipantDraft & { courseId: CourseId; gender: Gender; shirt: ShirtSize }
  >;
} {
  if (!draft.groupName.trim()) throw new Error("단체명을 입력하세요.");
  if (!draft.leaderName.trim()) throw new Error("대표자 성명을 입력하세요.");
  if (!draft.phone.trim()) throw new Error("휴대폰번호를 입력하세요.");
  if (!emailOk(draft.email)) throw new Error("이메일을 입력하세요.");
  if (!draft.participants.length) throw new Error("참가자를 1명 이상 등록하세요.");
  if (draft.participants.length > MAX_GROUP_SIZE) {
    throw new Error(`한 번에 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다.`);
  }
  draft.participants.forEach(assertParticipant);
  if (!requiredConsentsOk(draft)) {
    throw new Error("필수 약관에 동의해 주세요.");
  }
}

/** 퍼블리싱 스텁. 9/22에 실제 API로 교체. */
export async function submitEntry(draft: EntryDraft): Promise<EntryRecord> {
  await wait(480);
  assertDraft(draft);
  const seq = String(10000 + (draft.name.length * 317) % 90000);
  return {
    orderNo: `MR26-${draft.courseId.toUpperCase()}-${seq}`,
    courseId: draft.courseId,
    ticket: draft.ticket,
    name: draft.name.trim(),
    birth: draft.birth,
    gender: draft.gender,
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    emergency: draft.emergency.trim(),
    shirt: draft.shirt,
  };
}

/** 퍼블리싱 스텁. 주문번호 6자 이상이면 조회 성공으로 보여 줌. */
export async function lookupEntry(query: LookupQuery): Promise<EntryRecord | null> {
  await wait(420);
  const orderNo = query.orderNo.trim().toUpperCase();
  const name = query.name.trim();
  if (!name || !/^\d{8}$/.test(query.birth) || orderNo.length < 6) {
    return null;
  }
  const fromOrder = EVENT.courses.find((c) =>
    orderNo.includes(`-${c.id.toUpperCase()}-`),
  );
  return {
    orderNo,
    courseId: fromOrder?.id ?? "10k",
    ticket: "adult",
    name,
    birth: query.birth,
    gender: "none",
    phone: "010-0000-0000",
    email: "runner@marvelrun.kr",
    emergency: "010-0000-0000",
    shirt: "M",
  };
}

export async function submitGroup(draft: GroupDraft): Promise<GroupRecord> {
  await wait(520);
  assertGroup(draft);
  const seq = String(20000 + (draft.groupName.length * 419) % 80000);
  const people = draft.participants as SavedParticipant[];
  return {
    orderNo: `MR26-GRP-${seq}`,
    groupName: draft.groupName.trim(),
    leaderName: draft.leaderName.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    participants: people.map((p) => ({
      ...p,
      name: p.name.trim(),
      phone: p.phone.trim(),
    })),
  };
}

export async function lookupGroup(
  query: GroupLookupQuery,
): Promise<GroupRecord | null> {
  await wait(420);
  const orderNo = query.orderNo.trim().toUpperCase();
  const groupName = query.groupName.trim();
  const leaderName = query.leaderName.trim();
  if (!groupName || !leaderName || orderNo.length < 6) return null;
  return {
    orderNo,
    groupName,
    leaderName,
    phone: "010-0000-0000",
    email: "group@marvelrun.kr",
    participants: [
      {
        courseId: "10k",
        ticket: "adult",
        name: leaderName,
        birth: "19900101",
        gender: "none",
        phone: "010-0000-0000",
        shirt: "M",
      },
    ],
  };
}