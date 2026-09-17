export type PublicQuestionSearchTarget = "ALL" | "TITLE" | "AUTHOR";
export type PublicQuestionSort = "LATEST" | "OLDEST";

export type PublicQuestionListParams = {
  eventId?: string;
  target?: PublicQuestionSearchTarget;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: PublicQuestionSort;
};

export type PublicQuestionHeader = {
  no: number;
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  answered: boolean;
  secret: boolean;
};

export type PublicAnswerHeader = {
  no: number;
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
};

export type PublicQuestionListItem = {
  questionHeader: PublicQuestionHeader;
  answerHeader?: PublicAnswerHeader | null;
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

export type PublicQuestionDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  secret: boolean;
};

export type PublicAnswerDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  isSecret: boolean;
};

export type PublicQuestionDetailResponse = {
  questionDetail: PublicQuestionDetail;
  answerDetail?: PublicAnswerDetail | null;
};

export type CreatePublicQuestionBody = {
  post: {
    title: string;
    content: string;
    secret: boolean;
  };
  nickName: string;
  password: string;
};

export type UpdatePublicQuestionBody = {
  patch: {
    title: string;
    content: string;
    secret: boolean;
  };
  password: string;
};
