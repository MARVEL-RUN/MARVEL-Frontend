import { EVENT } from "./event";
import type { ConsentId } from "./legal";

export type CourseId = (typeof EVENT.courses)[number]["id"];
export type ShirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL";
export type Gender = "male" | "female" | "none";
export type ApplyKind = "individual" | "group";

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
  name: string;
  birth: string;
  gender: Gender | "";
  phone: string;
  shirt: ShirtSize | "";
};

export type GroupDraft = {
  groupName: string;
  leaderName: string;
  phone: string;
  email: string;
  participants: ParticipantDraft[];
} & Consents;

export type SavedParticipant = {
  courseId: CourseId;
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
  name: "",
  birth: "",
  gender: "",
  phone: "",
  shirt: "",
};

export const EMPTY_GROUP: GroupDraft = {
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

export function feeAmount(fee: string) {
  return Number(fee.replace(/[^\d]/g, "")) || 0;
}

export function formatFee(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function groupFee(draft: GroupDraft) {
  return draft.participants.reduce((sum, p) => {
    const course = p.courseId ? courseById(p.courseId) : undefined;
    return sum + (course ? feeAmount(course.fee) : 0);
  }, 0);
}

export function requiredConsentsOk(c: Consents) {
  return c.agreeRules && c.agreePrivacy && c.agreeThirdParty && c.agreeConsign;
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
  if (!draft.courseId) throw new Error("코스를 선택하세요.");
  if (!draft.name.trim()) throw new Error("이름을 입력하세요.");
  if (!/^\d{8}$/.test(draft.birth)) throw new Error("생년월일은 YYYYMMDD로 입력하세요.");
  if (!draft.gender) throw new Error("성별을 선택하세요.");
  if (!draft.phone.trim()) throw new Error("연락처를 입력하세요.");
  if (!draft.email.trim()) throw new Error("이메일을 입력하세요.");
  if (!draft.emergency.trim()) throw new Error("비상 연락처를 입력하세요.");
  if (!draft.shirt) throw new Error("티셔츠 사이즈를 선택하세요.");
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
  if (!p.courseId) throw new Error(`참가자 ${n}: 코스를 선택하세요.`);
  if (!p.name.trim()) throw new Error(`참가자 ${n}: 이름을 입력하세요.`);
  if (!/^\d{8}$/.test(p.birth)) {
    throw new Error(`참가자 ${n}: 생년월일은 YYYYMMDD로 입력하세요.`);
  }
  if (!p.gender) throw new Error(`참가자 ${n}: 성별을 선택하세요.`);
  if (!p.phone.trim()) throw new Error(`참가자 ${n}: 연락처를 입력하세요.`);
  if (!p.shirt) throw new Error(`참가자 ${n}: 티셔츠 사이즈를 선택하세요.`);
}

function assertGroup(draft: GroupDraft): asserts draft is GroupDraft & {
  participants: Array<
    ParticipantDraft & { courseId: CourseId; gender: Gender; shirt: ShirtSize }
  >;
} {
  if (!draft.groupName.trim()) throw new Error("단체명을 입력하세요.");
  if (!draft.leaderName.trim()) throw new Error("대표자 성명을 입력하세요.");
  if (!draft.phone.trim()) throw new Error("대표 연락처를 입력하세요.");
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
    orderNo.includes(c.id.toUpperCase()),
  );
  return {
    orderNo,
    courseId: fromOrder?.id ?? "10k",
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
        name: leaderName,
        birth: "19900101",
        gender: "none",
        phone: "010-0000-0000",
        shirt: "M",
      },
    ],
  };
}