export type AdminQuestionSearchTarget = "ALL" | "TITLE" | "AUTHOR";
export type AdminQuestionSort = "LATEST" | "OLDEST";

export type AdminQuestionListParams = {
  eventId?: string;
  target?: AdminQuestionSearchTarget;
  keyword?: string;
  isAnswered?: boolean;
  page?: number;
  size?: number;
  sort?: AdminQuestionSort;
};

export type AdminQuestionListItem = {
  no: number;
  questionId: string;
  questionTitle: string;
  authorName: string;
  questionCreatedAt: string;
  secret: boolean;
  answered: boolean;
  eventId: string;
  answerId?: string | null;
  answerTitle?: string | null;
  answerAuthorName?: string | null;
  answerCreatedAt?: string | null;
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

export type AdminQuestionDetail = {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  secret: boolean;
  answered: boolean;
};

export type AdminAnswerDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

export type AdminQuestionDetailResponse = {
  questionDetail: AdminQuestionDetail;
  answerDetail?: AdminAnswerDetail | null;
};

export type AnswerWriteBody = {
  title: string;
  content: string;
};
