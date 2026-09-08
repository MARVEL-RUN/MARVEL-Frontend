import {
  listGroupApplications,
  listIndividualApplications,
} from "./applications";
import { listAdminNotices } from "./notices";

export type AdminDashboardStats = {
  individualCount: number;
  groupCount: number;
  participantCount: number;
  pendingCount: number;
  noticeCount: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [entries, groups, notices] = await Promise.all([
    listIndividualApplications(),
    listGroupApplications(),
    listAdminNotices(),
  ]);

  const pendingCount =
    entries.filter((row) => row.status === "pending").length +
    groups.filter((row) => row.status === "pending").length;

  return {
    individualCount: entries.length,
    groupCount: groups.length,
    participantCount: groups.reduce((sum, row) => sum + row.participants.length, 0),
    pendingCount,
    noticeCount: notices.length,
  };
}
