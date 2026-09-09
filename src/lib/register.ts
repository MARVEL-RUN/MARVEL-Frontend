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

function assertDraft(draft: EntryDraft): asserts draft is EntryDraft & {
  courseId: CourseId;
  gender: Gender;
  shirt: ShirtSize;
} {
  if (!draft.courseId) throw new Error("참가종목을 선택하세요.");
  const picked = courseById(draft.courseId);
  if (!picked) throw new Error("참가종목을 선택하세요.");
  if (draft.ticket === "child" && !courseAllowsChild(picked)) {
    throw new Error("이 코스는 어린이 참가가 불가합니다.");
  }
  if (!draft.name.trim()) throw new Error("이름을 입력하세요.");
  if (!/^\d{8}$/.test(draft.birth)) throw new Error("생년월일을 선택하세요.");
  if (!draft.gender) throw new Error("성별을 선택하세요.");
  if (!draft.phone.trim()) throw new Error("휴대폰번호를 입력하세요.");
  if (!draft.email.trim()) throw new Error("이메일을 입력하세요.");
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
  if (!p.courseId) throw new Error(`참가자 ${n}: 참가종목을 선택하세요.`);
  const picked = courseById(p.courseId);
  if (p.ticket === "child" && picked && !courseAllowsChild(picked)) {
    throw new Error(`참가자 ${n}: 이 코스는 어린이 참가가 불가합니다.`);
  }
  if (!p.name.trim()) throw new Error(`참가자 ${n}: 이름을 입력하세요.`);
  if (!/^\d{8}$/.test(p.birth)) {
    throw new Error(`참가자 ${n}: 생년월일을 입력하세요.`);
  }
  if (!p.gender) throw new Error(`참가자 ${n}: 성별을 선택하세요.`);
  if (!p.phone.trim()) throw new Error(`참가자 ${n}: 연락처를 입력하세요.`);
  if (!p.shirt) throw new Error(`참가자 ${n}: 기념품을 선택하세요.`);
}

function assertGroup(draft: GroupDraft): asserts draft is GroupDraft & {
  participants: Array<
    ParticipantDraft & { courseId: CourseId; gender: Gender; shirt: ShirtSize }
  >;
} {
  if (!draft.groupName.trim()) throw new Error("단체명을 입력하세요.");
  if (!draft.leaderName.trim()) throw new Error("대표자 성명을 입력하세요.");
  if (!draft.phone.trim()) throw new Error("휴대폰번호를 입력하세요.");
  if (!draft.email.trim()) throw new Error("이메일을 입력하세요.");
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