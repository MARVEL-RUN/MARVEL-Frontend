export type AdminNoticeSearchTarget = "ALL" | "TITLE" | "CONTENT";
export type AdminNoticeSort = "LATEST" | "OLDEST";

export type AdminNoticeListParams = {
  eventId?: string;
  target?: AdminNoticeSearchTarget;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: AdminNoticeSort;
};

export type AdminNoticeCategory = {
  id: string;
  name: string;
};

export type AdminNoticeCreateBody = {
  categoryId: string;
  title: string;
  content: string;
};

export type AdminNoticeUpdateBody = {
  title: string;
  content: string;
  categoryId: string;
  deleteFileUrls?: string[];
};

export type AdminNoticeDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  noticeCategoryId: string;
  createdAt: string;
  viewCount?: number;
  attachmentUrls?: string[];
};
