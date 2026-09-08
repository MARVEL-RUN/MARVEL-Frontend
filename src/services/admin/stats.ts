import { listFaqs } from "./faqs";
import { listInquiries } from "./inquiries";
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
  faqCount: number;
  inquiryCount: number;
  unansweredCount: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [entries, groups, notices, faqs, inquiries] = await Promise.all([
    listIndividualApplications(),
    listGroupApplications(),
    listAdminNotices(),
    listFaqs(),
    listInquiries(),
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
    faqCount: faqs.length,
    inquiryCount: inquiries.length,
    unansweredCount: inquiries.filter((row) => !row.answer).length,
  };
}
