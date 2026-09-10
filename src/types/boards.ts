export type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  date: string;
};

export type InquiryAttachment = {
  id: string;
  name: string;
  size: number;
};

export type AdminInquiry = {
  id: string;
  name: string;
  title: string;
  body: string;
  date: string;
  answer?: string;
  answeredAt?: string;
  attachments?: InquiryAttachment[];
};
