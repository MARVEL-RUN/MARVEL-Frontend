import type { CourseId, EntryRecord, GroupRecord } from "@/lib/register";
import type { AdminPayStatus } from "@/types/admin";

export type AdminEntryRow = EntryRecord & {
  status: AdminPayStatus;
  appliedAt: string;
};

export type AdminGroupRow = GroupRecord & {
  status: AdminPayStatus;
  appliedAt: string;
  courseId: CourseId;
};

const ENTRIES: AdminEntryRow[] = [
  {
    orderNo: "MR26-A10482",
    courseId: "full",
    name: "김영웅",
    birth: "1992-04-12",
    gender: "male",
    phone: "010-1234-5678",
    email: "hero@example.com",
    emergency: "010-2222-3333",
    shirt: "L",
    status: "paid",
    appliedAt: "2026-09-22 14:03",
  },
  {
    orderNo: "MR26-A10491",
    courseId: "half",
    name: "이서진",
    birth: "1998-11-03",
    gender: "female",
    phone: "010-5555-1212",
    email: "seo@example.com",
    emergency: "010-7777-1212",
    shirt: "M",
    status: "pending",
    appliedAt: "2026-09-22 14:18",
  },
  {
    orderNo: "MR26-A10502",
    courseId: "10k",
    name: "박토르",
    birth: "1988-07-21",
    gender: "male",
    phone: "010-8800-4400",
    email: "thor@example.com",
    emergency: "010-8800-4401",
    shirt: "XL",
    status: "paid",
    appliedAt: "2026-09-22 15:02",
  },
  {
    orderNo: "MR26-A10511",
    courseId: "5k",
    name: "최나연",
    birth: "2001-02-14",
    gender: "female",
    phone: "010-3000-9000",
    email: "nayeon@example.com",
    emergency: "010-3000-9001",
    shirt: "S",
    status: "cancelled",
    appliedAt: "2026-09-22 15:40",
  },
];

const GROUPS: AdminGroupRow[] = [
  {
    orderNo: "MR26-G2011",
    groupName: "어벤져스 크루",
    leaderName: "스티브",
    phone: "010-1111-2222",
    email: "crew@example.com",
    courseId: "10k",
    status: "paid",
    appliedAt: "2026-09-22 14:40",
    participants: [
      {
        courseId: "10k",
        name: "스티브",
        birth: "1985-07-04",
        gender: "male",
        phone: "010-1111-2222",
        shirt: "L",
      },
      {
        courseId: "10k",
        name: "나타샤",
        birth: "1987-12-03",
        gender: "female",
        phone: "010-1111-3333",
        shirt: "S",
      },
    ],
  },
  {
    orderNo: "MR26-G2018",
    groupName: "엑스맨 런클럽",
    leaderName: "찰스",
    phone: "010-4444-5555",
    email: "xmen@example.com",
    courseId: "half",
    status: "pending",
    appliedAt: "2026-09-22 16:12",
    participants: [
      {
        courseId: "half",
        name: "찰스",
        birth: "1973-01-01",
        gender: "male",
        phone: "010-4444-5555",
        shirt: "M",
      },
      {
        courseId: "half",
        name: "진",
        birth: "1990-09-09",
        gender: "female",
        phone: "010-4444-6666",
        shirt: "M",
      },
      {
        courseId: "full",
        name: "로건",
        birth: "1975-05-05",
        gender: "male",
        phone: "010-4444-7777",
        shirt: "L",
      },
    ],
  },
];

const delay = () => new Promise((r) => setTimeout(r, 180));

export async function listIndividualApplications() {
  await delay();
  return ENTRIES;
}

export async function listGroupApplications() {
  await delay();
  return GROUPS;
}
