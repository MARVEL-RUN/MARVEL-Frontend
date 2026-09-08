export type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  date: string;
};

export type AdminInquiry = {
  id: string;
  name: string;
  title: string;
  body: string;
  date: string;
  answer?: string;
  answeredAt?: string;
};
