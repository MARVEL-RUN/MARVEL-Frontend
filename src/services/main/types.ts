export type RegistrationCreateRequest = {
  eventCategoryId: string;
  password: string;
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
  address: string;
  addressDetail: string;
};

export type RegistrationCreateResponse = {
  registrationId: string;
  registrationStatus: string;
  contractAmount: number;
  paymentId: string;
  orderId: string;
  orderName: string;
  paymentAmount: number;
};

export type PaymentConfirmRequest = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type PaymentConfirmResponse = {
  paymentId?: string;
  paymentStatus?: string;
  tossStatus?: string;
  registrationId?: string;
  registrationStatus?: string;
  orderId?: string;
  orderName?: string;
  paidAmount?: number;
  approvedAt?: string;
  receiptUrl?: string;
  [key: string]: unknown;
};
