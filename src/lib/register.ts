import { EVENT } from "./event";
import type { ConsentId } from "./legal";

export type CourseId = (typeof EVENT.courses)[number]["id"];
export type ShirtSize =
  | "S"
  | "M"
  | "L"
  | "XL"
  | "2XL"
  | "3XL"
  | "4XL"
  | "130"
  | "150";
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
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianConsent: boolean;
  shirt: ShirtSize | "";
  souvenirId: string;
  selectedSize: string;
  password: string;
  passwordConfirm: string;
  zonecode: string;
  address: string;
  addressDetail: string;
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
  guardianName: string;
  guardianPhone: string;
  shirt: ShirtSize;
};

export type ParticipantDraft = {
  categoryId: string;
  souvenirId: string;
  selectedSize: string;
  name: string;
  birth: string;
  gender: Gender | "";
  phone: string;
};

export type GroupDraft = {
  courseId: CourseId | "";
  groupName: string;
  organizationAccount: string;
  organizationPassword: string;
  passwordConfirm: string;
  leaderName: string;
  leaderBirth: string;
  phone: string;
  email: string;
  zonecode: string;
  address: string;
  addressDetail: string;
  guardianConsent: boolean;
  participants: ParticipantDraft[];
} & Consents;

export type SavedParticipant = {
  categoryId: string;
  souvenirId: string;
  selectedSize: string;
  name: string;
  birth: string;
  gender: Gender;
  phone: string;
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
  phone: string;
  password: string;
};

export type GroupLookupQuery = {
  account: string;
  password: string;
};

export const MAX_GROUP_SIZE = 20;

export const ADULT_SHIRT_SIZES: ShirtSize[] = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
];
export const CHILD_SHIRT_SIZES: ShirtSize[] = ["130", "150"];
export const SHIRT_SIZES: ShirtSize[] = [
  ...CHILD_SHIRT_SIZES,
  ...ADULT_SHIRT_SIZES,
];

export function shirtSizesForTicket(ticket: TicketKind): ShirtSize[] {
  return ticket === "child" ? [...CHILD_SHIRT_SIZES] : [...ADULT_SHIRT_SIZES];
}

export const GENDERS: { id: Exclude<Gender, "none">; label: string }[] = [
  { id: "male", label: "남성" },
  { id: "female", label: "여성" },
];

export const EMPTY_DRAFT: EntryDraft = {
  courseId: "",
  ticket: "adult",
  name: "",
  birth: "",
  gender: "",
  phone: "",
  email: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianConsent: false,
  shirt: "",
  souvenirId: "",
  selectedSize: "",
  password: "",
  passwordConfirm: "",
  zonecode: "",
  address: "",
  addressDetail: "",
  ...EMPTY_CONSENTS,
};

export const EMPTY_PARTICIPANT: ParticipantDraft = {
  categoryId: "",
  souvenirId: "",
  selectedSize: "",
  name: "",
  birth: "",
  gender: "",
  phone: "",
};

export const EMPTY_GROUP: GroupDraft = {
  courseId: "",
  groupName: "",
  organizationAccount: "",
  organizationPassword: "",
  passwordConfirm: "",
  leaderName: "",
  leaderBirth: "",
  phone: "",
  email: "",
  zonecode: "",
  address: "",
  addressDetail: "",
  guardianConsent: false,
  participants: [{ ...EMPTY_PARTICIPANT }],
  ...EMPTY_CONSENTS,
};

export function courseById(id: CourseId) {
  return EVENT.courses.find((c) => c.id === id);
}

export function genderLabel(id: Gender) {
  if (id === "male") return "남성";
  if (id === "female") return "여성";
  return "—";
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
export const GUARDIAN_BIRTH_FROM = nextYmd(shiftYmd(EVENT.raceYmd, -14));

export const CHILD_AGE_NOTE = `어린이 나이: 만 0세 ~ 만 12세 (${ymdKo(CHILD_BIRTH_FROM)} 이후 출생자)`;
export const CHILD_ACCOMPANY_NOTE =
  "만 12세 이하는 보호자 동행이 필요합니다.";
export const GUARDIAN_AGE_NOTE =
  "만 14세 미만의 경우 법정대리인 동의가 필요합니다.";
export const TIMING_CHIP_NOTE =
  "배번호 뒷면에 기록칩이 부착되어 있습니다. 2.3 Km 부문에는 기록칩이 없습니다.";

export type AgeBand = "tooYoung" | "child" | "teen" | "adult";

export function ageBand(birth: string): AgeBand | null {
  if (!/^\d{8}$/.test(birth)) return null;
  if (birth > EVENT.raceYmd) return "tooYoung";
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

export function groupNeedsGuardian(participants: { birth: string }[]) {
  return participants.some((p) => needsGuardian(p.birth));
}

export function guardianDraftStarted(
  draft: Pick<
    EntryDraft,
    "guardianName" | "guardianRelation" | "guardianPhone" | "guardianConsent"
  >,
) {
  return Boolean(
    draft.guardianName.trim() ||
      draft.guardianRelation.trim() ||
      draft.guardianPhone.trim(),
  );
}

export function guardianRequiredFor(
  draft: Pick<
    EntryDraft,
    "birth" | "guardianName" | "guardianRelation" | "guardianPhone" | "guardianConsent"
  >,
) {
  return needsGuardian(draft.birth) || guardianDraftStarted(draft);
}

export function guardianFieldsOk(
  draft: Pick<
    EntryDraft,
    "birth" | "guardianName" | "guardianRelation" | "guardianPhone" | "guardianConsent"
  >,
) {
  if (!guardianRequiredFor(draft)) return true;
  if (!draft.guardianName.trim()) return false;
  if (!draft.guardianRelation.trim()) return false;
  if (!draft.guardianPhone.trim()) return false;
  return draft.guardianConsent;
}

export function guardianFieldsError(
  draft: Pick<
    EntryDraft,
    "birth" | "guardianName" | "guardianRelation" | "guardianPhone" | "guardianConsent"
  >,
) {
  if (guardianFieldsOk(draft)) return "";
  if (!draft.guardianConsent) return "보호자(법정대리인) 동의가 필요합니다.";
  if (!draft.guardianRelation.trim()) return "보호자 관계를 입력하세요.";
  if (!draft.guardianName.trim() || !draft.guardianPhone.trim()) {
    return "보호자 이름·관계·연락처를 모두 입력하세요.";
  }
  return "보호자 정보를 모두 입력하세요.";
}

export function courseHasTimingChip(courseId: CourseId) {
  return courseId !== "2.3k";
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
  if (band === "tooYoung") return "대회일 이후 출생자는 참가할 수 없습니다.";
  if (band === "child") return "만 12세 이하 참가 불가";
  return "";
}

export function courseNote(
  course: NonNullable<ReturnType<typeof courseById>>,
) {
  if ("childFee" in course) return feeDigits(course.childFee);
  return "참가 불가";
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

/** 백엔드: 5~20자, 영문/숫자/ASCII 특수문자 */
export function filterOrgAccountInput(value: string) {
  return value.replace(/[^\x21-\x7E]/g, "");
}

export function orgAccountError(value: string) {
  const v = value.trim();
  if (!v) return "단체 계정을 입력하세요.";
  if (!/^[\x21-\x7E]{5,20}$/.test(v)) {
    return "단체 계정은 5~20자, 영문·숫자·특수문자만 사용할 수 있습니다.";
  }
  return "";
}

/** 백엔드: 6~64자 */
export function orgPasswordError(value: string) {
  const n = value.trim().length;
  if (n < 6 || n > 64) return "단체 비밀번호는 6~64자로 입력하세요.";
  return "";
}

/** 신청조회용: 4자 이상 */
export function entryPasswordError(value: string) {
  if (value.trim().length < 4) return "신청 비밀번호는 4자 이상 입력하세요.";
  return "";
}

export function groupFee(
  draft: GroupDraft,
  categories: { categoryId: string; amount: number }[] = [],
) {
  return draft.participants.reduce((sum, p) => {
    const category = categories.find((item) => item.categoryId === p.categoryId);
    return sum + (category?.amount ?? 0);
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
    throw new Error(`${prefix}대회일 이후 출생자는 참가할 수 없습니다.`);
  }
  if (!courseOpenForBirth(course, birth)) {
    throw new Error(`${prefix}이 코스는 만 12세 이하 참가가 불가합니다.`);
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
  if (draft.email.trim() && !emailOk(draft.email)) {
    throw new Error("이메일 형식을 확인하세요.");
  }
  if (!guardianFieldsOk(draft)) {
    throw new Error(guardianFieldsError(draft));
  }
  if (!draft.shirt) throw new Error("기념품을 선택하세요.");
  const passwordErr = entryPasswordError(draft.password);
  if (passwordErr) throw new Error(passwordErr);
  if (draft.password !== draft.passwordConfirm) {
    throw new Error("신청 비밀번호가 일치하지 않습니다.");
  }
  if (!draft.zonecode.trim() || !draft.address.trim()) {
    throw new Error("우편번호 찾기로 주소를 선택하세요.");
  }
  if (!draft.addressDetail.trim()) throw new Error("상세주소를 입력하세요.");
  if (!requiredConsentsOk(draft)) {
    throw new Error("필수 약관에 동의해 주세요.");
  }
}

function assertParticipant(
  p: ParticipantDraft,
  i: number,
): asserts p is ParticipantDraft & {
  categoryId: string;
  souvenirId: string;
  selectedSize: string;
  gender: Gender;
} {
  const n = i + 1;
  const prefix = `참가자 ${n}: `;
  if (!p.name.trim()) throw new Error(`${prefix}이름을 입력하세요.`);
  if (!/^\d{8}$/.test(p.birth)) {
    throw new Error(`${prefix}생년월일을 입력하세요.`);
  }
  if (ageBand(p.birth) === "tooYoung") {
    throw new Error(`${prefix}대회일 이후 출생자는 참가할 수 없습니다.`);
  }
  if (!p.gender) throw new Error(`${prefix}성별을 선택하세요.`);
  if (!p.phone.trim()) throw new Error(`${prefix}연락처를 입력하세요.`);
  if (!p.categoryId) throw new Error(`${prefix}참가종목을 선택하세요.`);
  if (!p.souvenirId) throw new Error(`${prefix}티셔츠 옵션을 불러오지 못했습니다.`);
  if (!p.selectedSize) throw new Error(`${prefix}티셔츠 사이즈를 선택하세요.`);
}

function assertGroup(draft: GroupDraft): asserts draft is GroupDraft & {
  participants: Array<
    ParticipantDraft & {
      categoryId: string;
      souvenirId: string;
      selectedSize: string;
      gender: Gender;
    }
  >;
} {
  if (!draft.groupName.trim()) throw new Error("단체명을 입력하세요.");
  const accountErr = orgAccountError(draft.organizationAccount);
  if (accountErr) throw new Error(accountErr);
  const passwordErr = orgPasswordError(draft.organizationPassword);
  if (passwordErr) throw new Error(passwordErr);
  if (draft.organizationPassword !== draft.passwordConfirm) {
    throw new Error("단체 비밀번호가 일치하지 않습니다.");
  }
  if (!draft.leaderName.trim()) throw new Error("대표자 성명을 입력하세요.");
  if (!/^\d{8}$/.test(draft.leaderBirth)) {
    throw new Error("대표자 생년월일을 선택하세요.");
  }
  if (!draft.phone.trim()) throw new Error("휴대폰번호를 입력하세요.");
  if (draft.email.trim() && !emailOk(draft.email)) {
    throw new Error("이메일 형식을 확인하세요.");
  }
  if (!draft.zonecode.trim() || !draft.address.trim()) {
    throw new Error("우편번호 찾기로 주소를 선택하세요.");
  }
  if (!draft.addressDetail.trim()) throw new Error("상세주소를 입력하세요.");
  if (!draft.participants.length) throw new Error("참가자를 1명 이상 등록하세요.");
  if (draft.participants.length > MAX_GROUP_SIZE) {
    throw new Error(`한 번에 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다.`);
  }
  draft.participants.forEach(assertParticipant);
  if (groupNeedsGuardian(draft.participants) && !draft.guardianConsent) {
    throw new Error("만 14세 미만 참가자가 있어 단체장 동의가 필요합니다.");
  }
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
    guardianName: draft.guardianName.trim(),
    guardianPhone: draft.guardianPhone.trim(),
    shirt: draft.shirt,
  };
}

/** 퍼블리싱 스텁. 조회 칸이 채워지면 성공으로 보여 줌. */
export async function lookupEntry(query: LookupQuery): Promise<EntryRecord | null> {
  await wait(420);
  const name = query.name.trim();
  const birth = query.birth.replace(/\D/g, "");
  const phone = formatPhone(query.phone);
  const phoneDigits = query.phone.replace(/\D/g, "");
  if (
    !name ||
    !/^\d{8}$/.test(birth) ||
    phoneDigits.length < 10 ||
    query.password.trim().length < 4
  ) {
    return null;
  }
  const seq = String(10000 + (name.length * 419) % 80000);
  return {
    orderNo: `MR26-10K-${seq}`,
    courseId: "10k",
    ticket: "adult",
    name,
    birth,
    gender: "none",
    phone,
    email: "runner@marvelrun.kr",
    guardianName: "",
    guardianPhone: "010-0000-0000",
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
  const account = query.account.trim();
  if (orgAccountError(account) || orgPasswordError(query.password)) return null;
  const seq = String(20000 + (account.length * 419) % 80000);
  return {
    orderNo: `MR26-GRP-${seq}`,
    groupName: account,
    leaderName: "대표자",
    phone: "010-0000-0000",
    email: "group@marvelrun.kr",
    participants: [
      {
        categoryId: "",
        souvenirId: "",
        selectedSize: "",
        name: "대표자",
        birth: "19900101",
        gender: "none",
        phone: "010-0000-0000",
      },
    ],
  };
}