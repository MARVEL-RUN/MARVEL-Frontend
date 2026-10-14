export type RegistrationSouvenir = {
  order: number;
  souvenirId: string;
  name: string;
  sizes: string[];
};

export type RegistrationStartGroup = {
  id: string;
  code: string;
  description: string;
};

export type RegistrationCategory = {
  order: number;
  categoryId: string;
  distance: string;
  categoryName: string;
  isActive: boolean;
  amount: number;
  souvenirs: RegistrationSouvenir[];
  startGroups?: RegistrationStartGroup[];
};

export type RegistrationPolicyReason = {
  code: string;
  message: string;
};

export type RegistrationOptionsResponse = {
  categories: RegistrationCategory[];
  registrationAllowed?: boolean;
  registrationReason?: RegistrationPolicyReason | null;
};

export type StartGroupInput = {
  startGroupId: string | null;
  startGroupUnselected: boolean;
};

export type PersonalStartGroupPatchRequest = {
  password: string;
} & StartGroupInput;

export type OrganizationStartGroupPatchItem = {
  registrationId: string;
} & StartGroupInput;

export type OrganizationStartGroupsPatchRequest = {
  password: string;
  registrations: OrganizationStartGroupPatchItem[];
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
  guardianPhNum?: string;
  guardianRelationship?: string;
  guardianConsent?: boolean;
  termsEssentialAgreed: boolean;
  termsMarketingAgreed: boolean;
  termsMarketingChannelAgreed: boolean;
  email?: string;
} & StartGroupInput;

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
  guardianConsent: boolean;
};

export type OrganizationParticipant = {
  eventCategoryId: string;
  selectedSouvenirList: SelectedSouvenir[];
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
} & StartGroupInput;

export type OrganizationRegistrationRequest = {
  account: OrganizationAccount;
  profile: OrganizationProfile;
  registrations: OrganizationParticipant[];
  termsEssentialAgreed: boolean;
  termsMarketingAgreed: boolean;
  termsMarketingChannelAgreed: boolean;
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

export type IndividualRegistrationLookupRequest = {
  name: string;
  birth: string;
  phNum: string;
  password: string;
};

export type OrganizationLookupRequest = {
  loginId: string;
  password: string;
};

export type PaymentRetryResponse = {
  paymentId?: string;
  orderId: string;
  orderName?: string;
  amount: number;
};

export type RegistrationReceiptMember = {
  registrationId: string;
  name?: string;
  birth?: string;
  phNum?: string;
  gender?: string;
  eventCategoryId?: string;
  eventCategoryName?: string;
  souvenirs?: RegistrationReceiptSouvenir[];
  selectedSouvenirList?: RegistrationReceiptSouvenir[];
  canceled?: boolean;
  registrationStatus?: string;
  status?: string;
  contractAmount?: number;
  paidAmount?: number;
  balance?: number;
};

export type RegistrationReceiptSouvenir = {
  souvenirId: string;
  name: string;
  size?: string;
  selectedSize?: string;
  quantity: number;
};

export type UserRegistrationPolicy = {
  modifyAllowed: boolean;
  modifyReason: RegistrationPolicyReason | null;
  paymentAllowed: boolean;
  paymentReason: RegistrationPolicyReason | null;
  refundAllowed: boolean;
  refundReason: RegistrationPolicyReason | null;
};

export type OrganizationRegistrationPolicy = UserRegistrationPolicy & {
  addMemberAllowed: boolean;
  addMemberReason: RegistrationPolicyReason | null;
};

export type MemberRegistrationPolicy = {
  modifyAllowed: boolean;
  modifyReason: RegistrationPolicyReason | null;
  deleteMemberAllowed: boolean;
  deleteMemberReason: RegistrationPolicyReason | null;
};

export type OrganizationLookupParticipant = {
  registrationId: string;
  name: string;
  email?: string;
  birth?: string;
  phNum?: string;
  phoneNumber?: string;
  gender?: string;
  eventCategoryId?: string;
  eventCategoryName?: string;
  selectedSouvenirList?: RegistrationReceiptSouvenir[];
  address?: string;
  addressDetail?: string;
  guardianName?: string;
  guardianPhNum?: string;
  canceled?: boolean;
  registrationStatus?: string;
  memberPolicy?: MemberRegistrationPolicy;
  startGroupId?: string | null;
  startGroupCode?: string | null;
  startGroupUnselected?: boolean;
};

export type RegistrationReceipt = {
  registrationId?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  loginId?: string | null;
  leaderName?: string | null;
  leaderBirth?: string | null;
  leaderPhNum?: string | null;
  name?: string | null;
  birth?: string | null;
  phNum?: string | null;
  gender?: string | null;
  eventCategoryId?: string | null;
  eventCategoryName?: string | null;
  selectedSouvenirList?: RegistrationReceiptSouvenir[];
  email?: string | null;
  address?: string | null;
  addressDetail?: string | null;
  guardianName?: string | null;
  guardianPhNum?: string | null;
  guardianRelationship?: string | null;
  guardianConsent?: boolean | null;
  members?: RegistrationReceiptMember[];
  registrations?: OrganizationLookupParticipant[];
  souvenirs?: RegistrationReceiptSouvenir[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus?: string;
  paymentStatusLabel?: string;
  registrationStatus?: string | null;
  refundStatus?: string | null;
  warningMessage?: string | null;
  paymentAction?: string;
  paymentId?: string | null;
  orderId?: string | null;
  externalPayment?: boolean;
  userPolicy?: UserRegistrationPolicy;
  organizationPolicy?: OrganizationRegistrationPolicy;
  startGroupId?: string | null;
  startGroupCode?: string | null;
  startGroupUnselected?: boolean;
};

export type RegistrationSouvenirSelection = {
  souvenirId: string;
  selectedSize?: string;
};

export type IndividualRegistrationModifyRequest = {
  access: IndividualRegistrationLookupRequest;
  eventCategoryId: string;
  selectedSouvenirList: RegistrationSouvenirSelection[];
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
  address?: string;
  addressDetail?: string;
  guardianName?: string;
  guardianPhNum?: string;
  guardianRelationship?: string;
  guardianConsent?: boolean;
  email?: string;
} & StartGroupInput;

export type OrganizationParticipantModifyRequest = {
  registrationId?: string;
  eventCategoryId: string;
  selectedSouvenirList: RegistrationSouvenirSelection[];
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
} & StartGroupInput;

export type OrganizationRegistrationModifyRequest = {
  access: OrganizationLookupRequest;
  registrations: OrganizationParticipantModifyRequest[];
  guardianConsent?: boolean;
  email?: string;
  address: string;
  addressDetail: string;
  leaderName: string;
  leaderBirth: string;
  leaderPhNum: string;
};

export type RegistrationSettlementRefund = {
  paymentCancelId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  correlationId?: string;
};

export type RegistrationSettlementResult = {
  members?: RegistrationReceiptMember[];
  orders?: PaymentRetryResponse[];
  refunds?: RegistrationSettlementRefund[];
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
