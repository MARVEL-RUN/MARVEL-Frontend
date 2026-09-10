import {
  type AdminRaceEventId,
  type VirtualRoundId,
  VIRTUAL_ROUND_LABEL,
} from "@/lib/admin/raceEvents";
import { courseById, type CourseId } from "@/lib/register";
import type { AdminPayStatus } from "@/types/admin";

export type ApplicationKind = "individual" | "group";

export type AdminApplicationRow = {
  id: string;
  no: number;
  eventId: AdminRaceEventId;
  kind: ApplicationKind;
  orderNo: string;
  /** 목록용 표시명 (개인명 또는 단체명) */
  name: string;
  /** 성명 */
  personName: string;
  /** 단체명 */
  groupName: string;
  leaderName?: string;
  birth?: string;
  courseId?: CourseId;
  round?: VirtualRoundId;
  souvenir: string;
  size: string;
  phone: string;
  guardianPhone: string;
  guardianRelation: string;
  gender?: "male" | "female";
  memberCount?: number;
  marketingConsent: boolean;
  amount: number;
  cardPaymentInfo: string;
  address: string;
  addressDetail: string;
  status: AdminPayStatus;
  appliedAt: string;
};

const ROWS: AdminApplicationRow[] = [
  {
    id: "mr-i-1",
    no: 10482,
    eventId: "marvel",
    kind: "individual",
    orderNo: "MR26-A10482",
    name: "김영웅",
    personName: "김영웅",
    groupName: "",
    birth: "1992-04-12",
    courseId: "10k",
    souvenir: "티셔츠",
    size: "L",
    phone: "010-1234-5678",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    marketingConsent: true,
    amount: 55000,
    cardPaymentInfo: "국민 ****-****-****-1234",
    address: "서울특별시 영등포구 여의대로 108",
    addressDetail: "101동 1001호",
    status: "paid",
    appliedAt: "2026-09-22 14:03",
  },
  {
    id: "mr-i-2",
    no: 10491,
    eventId: "marvel",
    kind: "individual",
    orderNo: "MR26-A10491",
    name: "이서진",
    personName: "이서진",
    groupName: "",
    birth: "1998-11-03",
    courseId: "2.3k",
    souvenir: "티셔츠",
    size: "M",
    phone: "010-5555-1212",
    guardianPhone: "",
    guardianRelation: "",
    gender: "female",
    marketingConsent: false,
    amount: 35000,
    cardPaymentInfo: "-",
    address: "경기도 성남시 분당구 판교역로 235",
    addressDetail: "B동 802호",
    status: "pending",
    appliedAt: "2026-09-22 14:18",
  },
  {
    id: "mr-i-3",
    no: 10502,
    eventId: "marvel",
    kind: "individual",
    orderNo: "MR26-A10502",
    name: "박토르",
    personName: "박토르",
    groupName: "",
    birth: "1988-07-21",
    courseId: "10k",
    souvenir: "티셔츠",
    size: "XL",
    phone: "010-8800-4400",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    marketingConsent: true,
    amount: 55000,
    cardPaymentInfo: "신한 ****-****-****-8899",
    address: "서울특별시 강남구 테헤란로 152",
    addressDetail: "20층",
    status: "paid",
    appliedAt: "2026-09-22 15:02",
  },
  {
    id: "mr-i-4",
    no: 10511,
    eventId: "marvel",
    kind: "individual",
    orderNo: "MR26-A10511",
    name: "최나연",
    personName: "최나연",
    groupName: "",
    birth: "2001-02-14",
    courseId: "5k",
    souvenir: "티셔츠",
    size: "S",
    phone: "010-3000-9000",
    guardianPhone: "010-3000-9001",
    guardianRelation: "모",
    gender: "female",
    marketingConsent: true,
    amount: 45000,
    cardPaymentInfo: "-",
    address: "인천광역시 연수구 센트럴로 123",
    addressDetail: "3동 501호",
    status: "refund_requested",
    appliedAt: "2026-09-22 15:40",
  },
  {
    id: "mr-g-1",
    no: 2011,
    eventId: "marvel",
    kind: "group",
    orderNo: "MR26-G2011",
    name: "어벤져스 크루",
    personName: "스티브",
    groupName: "어벤져스 크루",
    leaderName: "스티브",
    birth: "1985-07-04",
    courseId: "10k",
    souvenir: "티셔츠",
    size: "L",
    phone: "010-1111-2222",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    memberCount: 2,
    marketingConsent: false,
    amount: 110000,
    cardPaymentInfo: "기업 ****-****-****-2211",
    address: "서울특별시 마포구 월드컵북로 396",
    addressDetail: "지하 1층",
    status: "refunded",
    appliedAt: "2026-09-22 14:40",
  },
  {
    id: "mr-g-2",
    no: 2018,
    eventId: "marvel",
    kind: "group",
    orderNo: "MR26-G2018",
    name: "엑스맨 런클럽",
    personName: "찰스",
    groupName: "엑스맨 런클럽",
    leaderName: "찰스",
    birth: "1973-01-01",
    courseId: "2.3k",
    souvenir: "티셔츠",
    size: "M",
    phone: "010-4444-5555",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    memberCount: 3,
    marketingConsent: true,
    amount: 105000,
    cardPaymentInfo: "-",
    address: "부산광역시 해운대구 센텀중앙로 97",
    addressDetail: "12층 1201호",
    status: "pending",
    appliedAt: "2026-09-22 16:12",
  },
  {
    id: "vr-i-1",
    no: 3011,
    eventId: "virtual",
    kind: "individual",
    orderNo: "VR26-A3011",
    name: "한블랙",
    personName: "한블랙",
    groupName: "",
    birth: "1995-03-08",
    round: "1",
    souvenir: "블랙팬서 패키지",
    size: "-",
    phone: "010-7000-1001",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    marketingConsent: true,
    amount: 49000,
    cardPaymentInfo: "카카오 ****-****-****-1001",
    address: "서울특별시 종로구 세종대로 175",
    addressDetail: "401호",
    status: "paid",
    appliedAt: "2026-11-05 14:20",
  },
  {
    id: "vr-i-2",
    no: 3022,
    eventId: "virtual",
    kind: "individual",
    orderNo: "VR26-A3022",
    name: "송둠",
    personName: "송둠",
    groupName: "",
    birth: "1999-12-01",
    round: "2",
    souvenir: "닥터둠 패키지",
    size: "-",
    phone: "010-7000-2002",
    guardianPhone: "",
    guardianRelation: "",
    gender: "female",
    marketingConsent: false,
    amount: 49000,
    cardPaymentInfo: "-",
    address: "대전광역시 유성구 대학로 99",
    addressDetail: "기숙사 A동",
    status: "pending",
    appliedAt: "2026-11-26 10:05",
  },
  {
    id: "vr-i-3",
    no: 3033,
    eventId: "virtual",
    kind: "individual",
    orderNo: "VR26-A3033",
    name: "오딘손",
    personName: "오딘손",
    groupName: "",
    birth: "1990-08-17",
    round: "3",
    souvenir: "토르 패키지",
    size: "-",
    phone: "010-7000-3003",
    guardianPhone: "",
    guardianRelation: "",
    gender: "male",
    marketingConsent: true,
    amount: 49000,
    cardPaymentInfo: "현대 ****-****-****-3033",
    address: "대구광역시 수성구 동대구로 123",
    addressDetail: "5층",
    status: "paid",
    appliedAt: "2026-12-17 15:40",
  },
  {
    id: "vr-i-4",
    no: 3018,
    eventId: "virtual",
    kind: "individual",
    orderNo: "VR26-A3018",
    name: "김와칸다",
    personName: "김와칸다",
    groupName: "",
    birth: "1997-05-22",
    round: "1",
    souvenir: "블랙팬서 패키지",
    size: "-",
    phone: "010-7000-1018",
    guardianPhone: "010-7000-1019",
    guardianRelation: "부",
    gender: "female",
    marketingConsent: false,
    amount: 49000,
    cardPaymentInfo: "-",
    address: "광주광역시 서구 상무중앙로 61",
    addressDetail: "상가 2층",
    status: "pending",
    appliedAt: "2026-11-10 09:12",
  },
];

const delay = () => new Promise((r) => setTimeout(r, 180));

export async function listApplicationsByEvent(eventId: AdminRaceEventId) {
  await delay();
  return ROWS.filter((row) => row.eventId === eventId);
}

export async function listAllApplications() {
  await delay();
  return ROWS.slice();
}

export function applicationKindLabel(kind: ApplicationKind) {
  return kind === "individual" ? "개인" : "단체";
}

export function applicationCourseLabel(row: AdminApplicationRow) {
  if (row.round) return applicationRoundLabel(row);
  if (!row.courseId) return "-";
  return courseById(row.courseId)?.distance ?? row.courseId;
}

export function applicationRoundLabel(row: AdminApplicationRow) {
  if (!row.round) return "-";
  return VIRTUAL_ROUND_LABEL[row.round];
}

export function applicationGenderLabel(gender?: "male" | "female") {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "-";
}

export function applicationPayLabel(status: AdminPayStatus) {
  if (status === "paid") return "결제완료";
  if (status === "pending") return "미결제";
  if (status === "refund_requested") return "환불신청";
  return "환불완료";
}

export function formatAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}
