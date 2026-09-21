export type RegistrationSouvenir = {
  order: number;
  souvenirId: string;
  name: string;
  sizes: string[];
};

export type RegistrationCategory = {
  order: number;
  categoryId: string;
  distance: string;
  categoryName: string;
  isActive: boolean;
  amount: number;
  souvenirs: RegistrationSouvenir[];
};

export type RegistrationOptionsResponse = {
  categories: RegistrationCategory[];
};

export type SelectedSouvenir = {
  souvenirId: string;
  selectedSize: string;
};

export type RegistrationCreateRequest = {
  eventCategoryId: string;
  selectedSouvenirList: SelectedSouvenir[];
  password: string;
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
  address: string;
  addressDetail: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianConsent?: boolean;
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

export type OrganizationAccount = {
  organizationName: string;
  organizationLoginId: string;
  organizationPassword: string;
};

export type OrganizationProfile = {
  address: string;
  addressDetail: string;
  birth: string;
  phNum: string;
  email: string;
  leaderName: string;
};

export type OrganizationParticipant = {
  eventCategoryId: string;
  selectedSouvenirList: SelectedSouvenir[];
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
};

export type OrganizationRegistrationRequest = {
  account: OrganizationAccount;
  profile: OrganizationProfile;
  registrations: OrganizationParticipant[];
};

export type OrganizationRegistrationResponse = {
  organizationId?: string;
  registrationId?: string;
  registrationIds?: string[];
  registrationStatus?: string;
  paymentId?: string;
  orderId: string;
  orderName?: string;
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
  processStatus?: string;
  registrationId?: string;
  organizationId?: string;
  registrationIds?: string[];
  registrationStatus?: string;
  orderId?: string;
  orderName?: string;
  paidAmount?: number;
  amount?: number;
  approvedAt?: string;
  receiptUrl?: string;
  [key: string]: unknown;
};
