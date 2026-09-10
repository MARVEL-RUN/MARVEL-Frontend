import { listFaqs } from "./faqs";
import { listInquiries } from "./inquiries";
import { listAllApplications } from "./applications";
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
  const [applications, notices, faqs, inquiries] = await Promise.all([
    listAllApplications(),
    listAdminNotices(),
    listFaqs(),
    listInquiries(),
  ]);

  const individuals = applications.filter((row) => row.kind === "individual");
  const groups = applications.filter((row) => row.kind === "group");

  return {
    individualCount: individuals.length,
    groupCount: groups.length,
    participantCount:
      individuals.length + groups.reduce((sum, row) => sum + (row.memberCount ?? 0), 0),
    pendingCount: applications.filter((row) => row.status === "pending").length,
    noticeCount: notices.length,
    faqCount: faqs.length,
    inquiryCount: inquiries.length,
    unansweredCount: inquiries.filter((row) => !row.answer).length,
  };
}
