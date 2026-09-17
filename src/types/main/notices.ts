export type PublicNoticeSearchTarget = "ALL" | "TITLE" | "CONTENT";
export type PublicNoticeSort = "LATEST" | "OLDEST";

export type PublicNoticeListParams = {
  eventId?: string;
  target?: PublicNoticeSearchTarget;
  keyword?: string;
  page?: number;
  size?: number;
  limit?: number;
  sort?: PublicNoticeSort;
};

export type PublicNoticeListItem = {
  no: number;
  id: string;
  title: string;
  category: string;
  createdAt: string;
  author: string;
  viewCount: number;
};

export type PinnedNotice = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  author: string;
  viewCount: number;
};

export type SpringPage<T> = {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  content: T[];
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
};

export type PublicNoticeListResponse = {
  pinnedNoticeList: PinnedNotice[];
  noticePage: SpringPage<PublicNoticeListItem>;
};

export type PublicNoticeDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  noticeCategoryId: string;
  viewCount: number;
  createdAt: string;
  attachmentUrls?: string[];
};

export type NoticeRow = PinnedNotice & {
  no?: number;
  pinned: boolean;
};
