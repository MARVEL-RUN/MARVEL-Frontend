"use client";

import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { genderLabel } from "@/lib/registration-gender";
import {
  lookupEditScreenAllowed,
  lookupOrganizationStartGroupEditAllowed,
  lookupPersonalStartGroupEditAllowed,
  lookupPolicyNotes,
  lookupShowPaymentButton,
  lookupShowRefundOrCancelButton,
} from "@/lib/main/registrationActionPolicy";
import {
  hasStartGroupFeature,
  startGroupDisplayFromLookup,
  type StartGroupDraft,
} from "@/lib/start-group";
import { registrationStatusBadge, registrationStatusLabel } from "@/lib/registration-status";
import {
  consumeLookupRefreshAfterPayment,
  paymentOrderFromRetry,
  savePendingPayment,
} from "@/lib/payment/session";
import {
  applicationPasswordError,
  APPLICATION_PASSWORD_MIN,
  formatPhone,
  orgAccountError,
  type ApplyKind,
} from "@/lib/register";
import {
  cancelIndividualRegistration,
  cancelOrganizationRegistration,
  changeIndividualRegistrationPassword,
  changeOrganizationPassword,
  lookupIndividualRegistrations,
  lookupOrganizationRegistrations,
  modifyIndividualRegistration,
  modifyOrganizationRegistration,
  organizationLookupParticipants,
  retryIndividualPayment,
  retryOrganizationPayment,
} from "@/services/main/registrations";
import type {
  IndividualRegistrationLookupRequest,
  IndividualRegistrationModifyRequest,
  OrganizationLookupParticipant,
  OrganizationLookupRequest,
  OrganizationRegistrationModifyRequest,
  RegistrationReceipt,
  RegistrationReceiptMember,
  RegistrationReceiptSouvenir,
  RegistrationSettlementResult,
} from "@/services/main/types";
import { useFlowReset } from "@/lib/main/flowReset";
import { useAppHref } from "@/lib/main/useAppBasePath";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useLayoutEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { ApplyKindPick } from "../register/ApplyKindPick";
import { BirthText, PasswordField, PhoneField } from "../register/ApplyUi";
import { scrollPageTop } from "@/lib/scroll-page";
import { mainToast } from "../feedback/MainFeedback";
import {
  GroupLookupEdit,
  IndividualLookupEdit,
  LookupRefundModal,
  type LookupModifyAction,
} from "./LookupEditForms";
import { LookupPasswordModal, type LookupPasswordSubmit } from "./LookupPasswordModal";
import {
  LookupStartGroupModal,
  saveIndividualLookupStartGroup,
  saveOrganizationLookupStartGroups,
} from "./LookupStartGroupModal";

type View = "form" | "hit" | "miss";

const LOOKUP_LEAD =
  "신청 내역을 확인하기 위해 신청시와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.";

export function LookupPage() {
  const [kind, setKind] = useState<ApplyKind | "">("");

  useLayoutEffect(() => {
    scrollPageTop();
  }, [kind]);

  useFlowReset("lookup", () => {
    setKind("");
    requestAnimationFrame(scrollPageTop);
  });

  useLayoutEffect(() => {
    if (consumeLookupRefreshAfterPayment()) {
      mainToast.success("결제가 반영되었습니다. 조회 정보로 다시 확인해 주세요.");
    }
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="INTEL" title="신청조회" en="FIND YOUR ENTRY" />
      <div className="page__body wrap wrap--narrow">
        {!kind ? (
          <ApplyKindPick
            heading="조회 유형을 선택하세요"
            lookup
            onPick={setKind}
          />
        ) : kind === "group" ? (
          <GroupLookup onBack={() => setKind("")} />
        ) : (
          <IndividualLookup onBack={() => setKind("")} />
        )}
      </div>
    </main>
  );
}

function LookupNav({
  busy,
  onBack,
}: {
  busy: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flow__nav">
      <button type="button" className="btn btn--ghost" onClick={onBack}>
        유형 변경
      </button>
      <button type="submit" className="btn btn--red" disabled={busy}>
        {busy ? "확인 중..." : "확인하기"}
      </button>
    </div>
  );
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function toLookupBirth(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function individualIdentityError(name: string, birth: string, phone: string) {
  if (!name.trim()) return "이름을 입력하세요.";
  if (birth.replace(/\D/g, "").length !== 8) return "생년월일을 입력하세요.";
  if (phone.replace(/\D/g, "").length < 10) return "전화번호를 입력하세요.";
  return "";
}

function individualLookupFormError(name: string, birth: string, phone: string, password: string) {
  const identityErr = individualIdentityError(name, birth, phone);
  if (identityErr) return identityErr;
  const passwordErr = applicationPasswordError(password);
  if (passwordErr) return passwordErr;
  return "";
}

function individualPasswordTargets(receipts: RegistrationReceipt[]) {
  const ids = new Set<string>();
  for (const receipt of receipts) {
    const id = receipt.registrationId?.trim();
    if (id) ids.add(id);
    for (const member of organizationLookupParticipants(receipt)) {
      if (member.registrationId) ids.add(member.registrationId);
    }
  }
  return [...ids];
}

function organizationPasswordTargets(receipts: RegistrationReceipt[]) {
  const ids = new Set<string>();
  for (const receipt of receipts) {
    const id = receipt.organizationId?.trim();
    if (id) ids.add(id);
  }
  return [...ids];
}

function souvenirSize(item: RegistrationReceiptSouvenir) {
  return item.size || item.selectedSize || "";
}

type ReceiptMemberView = {
  id: string;
  name: string;
  course: string;
  startGroup: string;
  souvenirs: { id: string; name: string; size: string; quantity: number }[];
  canceled: boolean;
  status: string;
};

function memberSouvenirs(
  row: RegistrationReceiptMember | OrganizationLookupParticipant,
): RegistrationReceiptSouvenir[] {
  if ("selectedSouvenirList" in row && row.selectedSouvenirList?.length) {
    return row.selectedSouvenirList;
  }
  if ("souvenirs" in row && row.souvenirs?.length) return row.souvenirs;
  return [];
}

function participantPhone(
  row: RegistrationReceiptMember | OrganizationLookupParticipant,
) {
  const phone =
    "phoneNumber" in row && row.phoneNumber
      ? row.phoneNumber
      : row.phNum;
  return phone?.trim() ?? "";
}

function toMemberView(
  row: RegistrationReceiptMember | OrganizationLookupParticipant,
  index: number,
): ReceiptMemberView {
  return {
    id: row.registrationId || String(index),
    name: row.name ?? "",
    course: row.eventCategoryName ?? "",
    startGroup: startGroupDisplayFromLookup(
      "startGroupCode" in row ? row.startGroupCode : undefined,
      "startGroupUnselected" in row ? row.startGroupUnselected : undefined,
    ),
    souvenirs: memberSouvenirs(row).map((item) => ({
      id: item.souvenirId,
      name: item.name,
      size: souvenirSize(item),
      quantity: item.quantity ?? 1,
    })),
    canceled: row.canceled === true,
    status: row.registrationStatus || ("status" in row ? row.status ?? "" : ""),
  };
}

function receiptMembers(receipt: RegistrationReceipt): ReceiptMemberView[] {
  return organizationLookupParticipants(receipt).map(toMemberView);
}

function receiptSouvenirs(receipt: RegistrationReceipt) {
  if (receipt.selectedSouvenirList?.length) return receipt.selectedSouvenirList;
  if (receipt.souvenirs?.length) return receipt.souvenirs;
  return receiptMembers(receipt)
    .filter((member) => !member.canceled)
    .flatMap((member) =>
      member.souvenirs.map((item) => ({
        souvenirId: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
      })),
    );
}

function lookupBirthView(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return (raw ?? "").trim();
}

function receiptAddress(receipt: RegistrationReceipt) {
  return [receipt.address, receipt.addressDetail].filter(Boolean).join(" ").trim();
}

function ReceiptContactSpec({ receipt }: { receipt: RegistrationReceipt }) {
  const address = receiptAddress(receipt);
  return (
    <>
      {receipt.orderId ? (
        <div>
          <dt>주문번호</dt>
          <dd className="spec__code">{receipt.orderId}</dd>
        </div>
      ) : null}
      <div>
        <dt>이메일</dt>
        <dd>{receipt.email?.trim() || "—"}</dd>
      </div>
      {address ? (
        <div>
          <dt>주소</dt>
          <dd>{address}</dd>
        </div>
      ) : null}
    </>
  );
}

function ReceiptPaymentSpec({ receipt }: { receipt: RegistrationReceipt }) {
  return (
    <>
      <div>
        <dt>결제금액</dt>
        <dd>{formatWon(receipt.totalAmount)}</dd>
      </div>
      <div>
        <dt>납부금액</dt>
        <dd>{formatWon(receipt.paidAmount)}</dd>
      </div>
    </>
  );
}

function ReceiptSouvenirSpec({ souvenirs }: { souvenirs: RegistrationReceiptSouvenir[] }) {
  if (!souvenirs.length) return null;
  return (
    <>
      {souvenirs.map((item, i) => {
        const size = souvenirSize(item);
        const detail = [size, item.quantity > 1 ? `${item.quantity}개` : ""]
          .filter(Boolean)
          .join(" · ");
        return (
          <div key={`${item.souvenirId}-${size}-${i}`}>
            <dt>{item.name}</dt>
            <dd>{detail || "—"}</dd>
          </div>
        );
      })}
    </>
  );
}

function ReceiptMemberList({ members }: { members: ReceiptMemberView[] }) {
  if (!members.length) return null;
  const active = members.filter((member) => !member.canceled);
  const canceled = members.filter((member) => member.canceled);
  return (
    <ul className="lookup-members">
      {active.map((member, i) => (
        <ReceiptMemberRow
          key={member.id}
          no={String(i + 1).padStart(2, "0")}
          member={member}
          status={registrationStatusLabel(member.status)}
          tone={registrationStatusBadge(member.status)}
        />
      ))}
      {canceled.map((member) => (
        <ReceiptMemberRow
          key={member.id}
          no="—"
          member={member}
          status="취소"
          tone="refunded"
          canceled
        />
      ))}
    </ul>
  );
}

function ReceiptMemberRow({
  no,
  member,
  status,
  tone,
  canceled = false,
}: {
  no: string;
  member: ReceiptMemberView;
  status: string;
  tone: string;
  canceled?: boolean;
}) {
  const size = member.souvenirs[0]?.size;
  const startGroup = member.startGroup && member.startGroup !== "—" ? member.startGroup : "";
  return (
    <li className={canceled ? "is-canceled" : undefined}>
      <span className="lookup-members__no">{no}</span>
      <div className="lookup-members__main">
        <p className="lookup-members__head">
          <strong>{member.name || "참가자"}</strong>
          {member.course ? <span className="lookup-members__course">{member.course}</span> : null}
        </p>
        {!canceled && ((hasStartGroupFeature && startGroup) || size) ? (
          <dl className="lookup-members__meta">
            {hasStartGroupFeature && startGroup ? (
              <div>
                <dt>출발 그룹</dt>
                <dd>{startGroup}</dd>
              </div>
            ) : null}
            {size ? (
              <div>
                <dt>사이즈</dt>
                <dd>{size}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
      {status ? (
        <span className={`lookup-members__status lookup-members__status--${tone}`}>{status}</span>
      ) : null}
    </li>
  );
}

function payableOrder(result: RegistrationSettlementResult) {
  return (
    result.orders?.find((order) => order.orderId && Number(order.amount) > 0) ?? null
  );
}

function receiptPayKey(receipt: RegistrationReceipt) {
  return (
    receipt.registrationId ||
    receipt.organizationId ||
    receipt.paymentId ||
    receipt.orderId ||
    ""
  );
}

type LookupRefreshKeep = {
  receipt: RegistrationReceipt;
  panel: "edit" | "cancel";
};

function matchRegistrationReceipt(
  rows: RegistrationReceipt[],
  target: RegistrationReceipt,
) {
  const key = receiptPayKey(target);
  if (!key) return null;
  return rows.find((row) => receiptPayKey(row) === key) ?? null;
}

function ReceiptActions({
  receipt,
  busy,
  passwordBusy,
  onPay,
  onEdit,
  onStartGroup,
  startGroupEdit,
  onPassword,
  onRefund,
}: {
  receipt: RegistrationReceipt;
  busy: boolean;
  passwordBusy?: boolean;
  onPay?: () => void;
  onEdit?: () => void;
  onStartGroup?: () => void;
  startGroupEdit?: boolean;
  onPassword: () => void;
  onRefund?: () => void;
}) {
  const pay = Boolean(onPay && lookupShowPaymentButton(receipt));
  const edit = Boolean(onEdit && lookupEditScreenAllowed(receipt));
  const startGroup = Boolean(onStartGroup && startGroupEdit);
  const refund = Boolean(onRefund && lookupShowRefundOrCancelButton(receipt));
  return (
    <div className="flow__nav flow__nav--receipt">
      {edit ? (
        <button type="button" className="btn btn--ghost" onClick={onEdit} disabled={busy}>
          수정
        </button>
      ) : null}
      {startGroup ? (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onStartGroup}
          disabled={busy}
        >
          출발 그룹 설정
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn--ghost-gold"
        onClick={onPassword}
        disabled={busy || passwordBusy}
      >
        비밀번호 변경
      </button>
      {refund ? (
        <button type="button" className="btn btn--ghost-red" onClick={onRefund} disabled={busy}>
          환불 신청
        </button>
      ) : null}
      {pay ? (
        <button type="button" className="btn btn--red" onClick={onPay} disabled={busy}>
          {busy ? "결제 준비 중..." : "결제하기"}
        </button>
      ) : null}
    </div>
  );
}

function ReceiptNotes({
  receipt,
  externalPayment = false,
}: {
  receipt: RegistrationReceipt;
  externalPayment?: boolean;
}) {
  const inquiryHref = useAppHref("/inquiry/write");
  const warning = receipt.warningMessage?.trim() ?? "";
  const policyNotes = lookupPolicyNotes(receipt);
  if (!externalPayment && !warning && policyNotes.length === 0) return null;
  return (
    <div className="ticket__notes">
      {externalPayment ? (
        <p className="form__note form__note--external">
          <strong>외부 결제 건은 결제·일반 수정·환불을 진행할 수 없습니다.</strong>
          <span>
            {hasStartGroupFeature
              ? "출발 그룹은 「출발 그룹 설정」에서 변경할 수 있습니다. 그 외 개인정보 수정은 "
              : "개인정보 수정은 "}
            <Link href={inquiryHref}>문의사항</Link>을 남겨 주세요.
          </span>
        </p>
      ) : null}
      {warning ? <p className="form__note">{warning}</p> : null}
      {policyNotes.length ? <PolicyNoticeBox lines={policyNotes} inquiryHref={inquiryHref} /> : null}
    </div>
  );
}

function splitSentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
}

/** 모든 문구 끝 문장이 같으면 한 번만 */
function commonTailSentence(lines: string[]) {
  if (lines.length < 2) return "";
  const tails = lines.map((line) => {
    const parts = splitSentences(line);
    return parts.length > 1 ? parts[parts.length - 1] : "";
  });
  return tails[0] && tails.every((tail) => tail === tails[0]) ? tails[0] : "";
}

function PolicyNoticeBox({ lines, inquiryHref }: { lines: string[]; inquiryHref: string }) {
  const tail = commonTailSentence(lines);
  const items = tail
    ? lines.map((line) => splitSentences(line).slice(0, -1).join(" "))
    : lines;
  return (
    <section className="ticket-notice" aria-label="신청 안내">
      <p className="ticket-notice__title">안내</p>
      <ul className="ticket-notice__list">
        {items.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {tail ? (
        <p className="ticket-notice__tail">
          {tail} <Link href={inquiryHref}>문의사항 남기기</Link>
        </p>
      ) : null}
    </section>
  );
}

function IndividualReceiptCard({
  receipt,
  name,
  busy,
  passwordBusy,
  onPay,
  onEdit,
  onStartGroup,
  startGroupEdit,
  onPassword,
  onRefund,
}: {
  receipt: RegistrationReceipt;
  name: string;
  busy?: boolean;
  passwordBusy?: boolean;
  onPay?: () => void;
  onEdit?: () => void;
  onStartGroup?: () => void;
  startGroupEdit?: boolean;
  onPassword: () => void;
  onRefund?: () => void;
}) {
  const members = receiptMembers(receipt);
  const displayName = receipt.name?.trim() || members[0]?.name || name;
  const course =
    receipt.eventCategoryName?.trim() ||
    members.find((member) => !member.canceled)?.course ||
    "";
  const birth = lookupBirthView(receipt.birth);
  const phone = receipt.phNum ? formatPhone(receipt.phNum) : "";
  const gender = genderLabel(receipt.gender);
  const address = receiptAddress(receipt);
  const registrationLabel = registrationStatusLabel(
    receipt.registrationStatus ?? undefined,
  );
  const guardianName = receipt.guardianName?.trim() ?? "";
  const guardianPhone = receipt.guardianPhNum
    ? formatPhone(receipt.guardianPhNum)
    : "";
  const externalPayment = receipt.externalPayment === true;

  return (
    <section className="ticket">
      <p className="kicker">FOUND</p>
      <h2>
        개인 접수 <em>확인</em>
      </h2>
      <dl className="spec">
        <div>
          <dt>이름</dt>
          <dd>{displayName || "—"}</dd>
        </div>
        {birth ? (
          <div>
            <dt>생년월일</dt>
            <dd>{birth}</dd>
          </div>
        ) : null}
        {gender ? (
          <div>
            <dt>성별</dt>
            <dd>{gender}</dd>
          </div>
        ) : null}
        {phone ? (
          <div>
            <dt>전화번호</dt>
            <dd>{phone}</dd>
          </div>
        ) : null}
        <div>
          <dt>보호자</dt>
          <dd>{guardianName || "—"}</dd>
        </div>
        <div>
          <dt>보호자 관계</dt>
          <dd>{receipt.guardianRelationship?.trim() || "—"}</dd>
        </div>
        <div>
          <dt>보호자 연락처</dt>
          <dd>{guardianPhone || "—"}</dd>
        </div>
        <div>
          <dt>보호자 동의</dt>
          <dd>{receipt.guardianConsent === true ? "동의함" : "—"}</dd>
        </div>
        {address ? (
          <div>
            <dt>주소</dt>
            <dd>{address}</dd>
          </div>
        ) : null}
        {course ? (
          <div>
            <dt>코스</dt>
            <dd>{course}</dd>
          </div>
        ) : null}
        {hasStartGroupFeature ? (
          <div>
            <dt>출발 그룹</dt>
            <dd>
              {startGroupDisplayFromLookup(
                receipt.startGroupCode,
                receipt.startGroupUnselected,
              )}
            </dd>
          </div>
        ) : null}
        <ReceiptSouvenirSpec souvenirs={receiptSouvenirs(receipt)} />
        {receipt.orderId ? (
          <div>
            <dt>주문번호</dt>
            <dd className="spec__code">{receipt.orderId}</dd>
          </div>
        ) : null}
        <div>
          <dt>이메일</dt>
          <dd>{receipt.email?.trim() || "—"}</dd>
        </div>
        <div>
          <dt>신청상태</dt>
          <dd>{registrationLabel}</dd>
        </div>
        <ReceiptPaymentSpec receipt={receipt} />
      </dl>
      <ReceiptNotes receipt={receipt} externalPayment={externalPayment} />
      <ReceiptActions
        receipt={receipt}
        busy={Boolean(busy)}
        passwordBusy={passwordBusy}
        onPay={externalPayment ? undefined : onPay}
        onEdit={externalPayment ? undefined : onEdit}
        onStartGroup={onStartGroup}
        startGroupEdit={startGroupEdit}
        onPassword={onPassword}
        onRefund={externalPayment ? undefined : onRefund}
      />
    </section>
  );
}

function GroupReceiptCard({
  receipt,
  busy,
  passwordBusy,
  onPay,
  onEdit,
  onStartGroup,
  startGroupEdit,
  onPassword,
  onRefund,
}: {
  receipt: RegistrationReceipt;
  busy?: boolean;
  passwordBusy?: boolean;
  onPay?: () => void;
  onEdit?: () => void;
  onStartGroup?: () => void;
  startGroupEdit?: boolean;
  onPassword: () => void;
  onRefund?: () => void;
}) {
  const members = receiptMembers(receipt);
  const activeCount = members.filter((member) => !member.canceled).length;
  const registrationLabel = registrationStatusLabel(
    receipt.registrationStatus ?? undefined,
  );
  return (
    <section className="ticket">
      <p className="kicker">FOUND</p>
      <h2>
        단체 접수 <em>확인</em>
      </h2>
      <dl className="spec">
        <div>
          <dt>단체명</dt>
          <dd>{receipt.organizationName || "—"}</dd>
        </div>
        <div>
          <dt>대표자</dt>
          <dd>{receipt.leaderName?.trim() || "—"}</dd>
        </div>
        <div>
          <dt>대표자 생년월일</dt>
          <dd>{lookupBirthView(receipt.leaderBirth) || "—"}</dd>
        </div>
        <div>
          <dt>대표자 연락처</dt>
          <dd>{receipt.leaderPhNum ? formatPhone(receipt.leaderPhNum) : "—"}</dd>
        </div>
        <div>
          <dt>인원</dt>
          <dd>{activeCount}명</dd>
        </div>
        <ReceiptContactSpec receipt={receipt} />
        <div>
          <dt>신청상태</dt>
          <dd>{registrationLabel}</dd>
        </div>
        <ReceiptPaymentSpec receipt={receipt} />
        <ReceiptSouvenirSpec souvenirs={receipt.souvenirs ?? []} />
      </dl>
      <ReceiptMemberList members={members} />
      <ReceiptNotes
        receipt={receipt}
        externalPayment={receipt.externalPayment === true}
      />
      <ReceiptActions
        receipt={receipt}
        busy={Boolean(busy)}
        passwordBusy={passwordBusy}
        onPay={onPay}
        onEdit={onEdit}
        onStartGroup={onStartGroup}
        startGroupEdit={startGroupEdit}
        onPassword={onPassword}
        onRefund={onRefund}
      />
    </section>
  );
}

function isTechnicalErrorMessage(message: string) {
  const text = message.trim();
  if (!text) return true;
  if (text.length > 180) return true;
  if (/^HTTP\s*\d+/i.test(text)) return true;
  return /JDBC|SQLException|\bSQL\b|Internal Server Error|Exception executing/i.test(
    text,
  );
}

function lookupErrorMessage(err: unknown, fallback = "신청 내역을 조회하지 못했습니다.") {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.trim();
  if (!message || isTechnicalErrorMessage(message)) return fallback;
  return message;
}

const REFUND_DONE_NOTE =
  "환불 처리 후 카드사에 따라 영업일 기준 일주일 내외 소요됩니다.";

function LookupRefundDone({ onOther }: { onOther: () => void }) {
  return (
    <section className="block wait">
      <p className="kicker">DONE</p>
      <h2>환불이 접수되었습니다.</h2>
      <p className="sec__body">{REFUND_DONE_NOTE}</p>
      <button type="button" className="btn btn--red" onClick={onOther}>
        다른 접수건
      </button>
    </section>
  );
}

function IndividualLookup({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const paymentHref = useAppHref("/payment");
  const [view, setView] = useState<View>("form");
  const [panel, setPanel] = useState<"list" | "edit" | "cancel" | "done">("list");
  const [busy, setBusy] = useState(false);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState<RegistrationReceipt[]>([]);
  const [active, setActive] = useState<RegistrationReceipt | null>(null);
  const [access, setAccess] = useState<IndividualRegistrationLookupRequest | null>(
    null,
  );
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [startGroupOpen, setStartGroupOpen] = useState(false);
  const [startGroupBusy, setStartGroupBusy] = useState(false);
  const [startGroupError, setStartGroupError] = useState("");

  useLayoutEffect(() => {
    if (view !== "hit" || panel !== "list") return;
    scrollPageTop();
    requestAnimationFrame(scrollPageTop);
  }, [view, panel]);

  function openPasswordChange() {
    setError("");
    setPasswordError("");
    setPasswordOpen(true);
  }

  function openStartGroup(receipt: RegistrationReceipt) {
    setError("");
    setStartGroupError("");
    setActive(receipt);
    setStartGroupOpen(true);
  }

  async function onChangePassword(input: LookupPasswordSubmit) {
    if (input.kind !== "individual") return;
    const currentPassword = input.currentPassword;
    const newPassword = input.newPassword;
    setName(input.name);
    setBirth(input.birth);
    setPhone(input.phone);
    if (!hasMainApi) {
      setPasswordError("API 주소가 설정되지 않았습니다.");
      return;
    }
    const body: IndividualRegistrationLookupRequest = {
      name: input.name.trim(),
      birth: toLookupBirth(input.birth),
      phNum: input.phone.replace(/\D/g, ""),
      password: currentPassword,
    };
    setPasswordBusy(true);
    setPasswordError("");
    try {
      const found = await lookupIndividualRegistrations(DEFAULT_EVENT_ID, body);
      const ids = individualPasswordTargets(Array.isArray(found) ? found : []);
      if (!ids.length) {
        setPasswordError("이름·생년월일·전화번호·비밀번호를 다시 확인해 주세요.");
        return;
      }
      const failures: string[] = [];
      for (const registrationId of ids) {
        try {
          await changeIndividualRegistrationPassword(DEFAULT_EVENT_ID, registrationId, {
            currentPassword,
            newPassword,
          });
        } catch (err) {
          failures.push(lookupErrorMessage(err, "비밀번호를 변경하지 못했습니다."));
        }
      }
      if (failures.length) {
        setPasswordError(
          failures.length === ids.length
            ? failures[0]
            : "일부 접수의 비밀번호를 바꾸지 못했습니다.",
        );
        return;
      }
      setPassword(newPassword);
      setPasswordOpen(false);
      mainToast.success("비밀번호가 변경되었습니다.");
    } catch (err) {
      setPasswordError(lookupErrorMessage(err, "비밀번호를 변경하지 못했습니다."));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = individualLookupFormError(name, birth, phone, password);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!hasMainApi) {
      setError("API 주소가 설정되지 않았습니다.");
      return;
    }
    const body: IndividualRegistrationLookupRequest = {
      name: name.trim(),
      birth: toLookupBirth(birth),
      phNum: phone.replace(/\D/g, ""),
      password: password.trim(),
    };
    setBusy(true);
    setError("");
    try {
      const found = await lookupIndividualRegistrations(DEFAULT_EVENT_ID, body);
      const rows = Array.isArray(found) ? found : [];
      setAccess(body);
      setReceipts(rows);
      setActive(null);
      setPanel("list");
      setView(rows.length ? "hit" : "miss");
    } catch (err) {
      setError(lookupErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onRetryPay(receipt: RegistrationReceipt) {
    if (!hasMainApi || !hasTossClientKey) {
      setError("결제 연동 설정이 필요합니다. env 변경 후 다시 시도해 주세요.");
      return;
    }
    if (!access || !lookupShowPaymentButton(receipt) || !receipt.paymentId) {
      setError("결제할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    const registrationId =
      receipt.registrationId ||
      receiptMembers(receipt).find((member) => !member.canceled)?.id;
    if (!registrationId) {
      setError("결제할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    const key = receiptPayKey(receipt);
    setPayingKey(key);
    setError("");
    try {
      const retried = await retryIndividualPayment(
        DEFAULT_EVENT_ID,
        registrationId,
        receipt.paymentId,
        access,
      );
      savePendingPayment({
        registration: paymentOrderFromRetry(retried),
        customerName: (receipt.name || receiptMembers(receipt)[0]?.name || name).trim(),
        savedAt: Date.now(),
        fromLookup: true,
      });
      router.push(paymentHref);
    } catch (err) {
      setError(lookupErrorMessage(err, "결제를 시작하지 못했습니다."));
      if (access) {
        await reloadIndividualAfterActionFailure(access);
      }
    } finally {
      setPayingKey(null);
    }
  }

  async function refreshIndividual(
    nextAccess: IndividualRegistrationLookupRequest,
    keep?: LookupRefreshKeep,
  ) {
    const found = await lookupIndividualRegistrations(DEFAULT_EVENT_ID, nextAccess);
    const rows = Array.isArray(found) ? found : [];
    setAccess(nextAccess);
    setReceipts(rows);
    setName(nextAccess.name);
    setBirth(nextAccess.birth.replace(/\D/g, ""));
    setPhone(nextAccess.phNum);
    setView(rows.length ? "hit" : "miss");
    if (keep && rows.length) {
      const next = matchRegistrationReceipt(rows, keep.receipt);
      if (next) {
        setActive(next);
        setPanel(keep.panel);
        return;
      }
    }
    setActive(null);
    setPanel("list");
  }

  async function reloadIndividualAfterActionFailure(
    cred: IndividualRegistrationLookupRequest,
    keep?: LookupRefreshKeep,
  ) {
    try {
      await refreshIndividual(cred, keep);
    } catch {
      /* 요청 오류 메시지 유지 */
    }
  }

  async function onModify(body: IndividualRegistrationModifyRequest, action: LookupModifyAction) {
    if (!active?.registrationId) {
      setError("수정할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const settled = await modifyIndividualRegistration(
        DEFAULT_EVENT_ID,
        active.registrationId,
        body,
      );
      const order = payableOrder(settled);
      const nextAccess: IndividualRegistrationLookupRequest = {
        ...body.access,
        name: body.name,
        birth: body.birth,
        phNum: body.phNum,
      };
      if (action === "pay") {
        if (order) {
          if (!hasTossClientKey) {
            setError("결제 연동 설정이 필요합니다. env 변경 후 다시 시도해 주세요.");
            return;
          }
          savePendingPayment({
            registration: paymentOrderFromRetry(order),
            customerName: body.name.trim(),
            savedAt: Date.now(),
            fromLookup: true,
          });
          setAccess(nextAccess);
          router.push(paymentHref);
          return;
        }
        if (access && active.paymentId && lookupShowPaymentButton(active)) {
          const retried = await retryIndividualPayment(
            DEFAULT_EVENT_ID,
            active.registrationId,
            active.paymentId,
            access,
          );
          savePendingPayment({
            registration: paymentOrderFromRetry(retried),
            customerName: body.name.trim(),
            savedAt: Date.now(),
            fromLookup: true,
          });
          setAccess(nextAccess);
          router.push(paymentHref);
          return;
        }
        setError("결제를 시작할 수 없습니다. 수정 내용은 저장되었는지 조회 화면에서 확인해 주세요.");
        await refreshIndividual(nextAccess);
        return;
      }
      await refreshIndividual(nextAccess);
      mainToast.success("수정이 완료되었습니다.");
    } catch (err) {
      setError(lookupErrorMessage(err, "접수를 수정하지 못했습니다."));
      const cred = access ?? body.access;
      if (cred) {
        await reloadIndividualAfterActionFailure(cred);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!access || !active?.registrationId) {
      setError("환불할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    const cancelTarget = active;
    setBusy(true);
    setError("");
    try {
      await cancelIndividualRegistration(
        DEFAULT_EVENT_ID,
        active.registrationId,
        access,
      );
      setPanel("done");
    } catch (err) {
      setError(lookupErrorMessage(err, "환불을 신청하지 못했습니다."));
      await reloadIndividualAfterActionFailure(access, {
        receipt: cancelTarget,
        panel: "cancel",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveStartGroup(password: string, draft: StartGroupDraft) {
    if (!active || !access) {
      setStartGroupError("조회 정보를 확인하지 못했습니다.");
      return;
    }
    setStartGroupBusy(true);
    setStartGroupError("");
    try {
      await saveIndividualLookupStartGroup(active, password, draft);
      await refreshIndividual(access);
      setStartGroupOpen(false);
      setActive(null);
      mainToast.success("출발 그룹이 변경되었습니다.");
    } catch (err) {
      setStartGroupError(
        lookupErrorMessage(err, "출발 그룹을 저장하지 못했습니다."),
      );
    } finally {
      setStartGroupBusy(false);
    }
  }

  if (view === "miss") {
    return (
      <section className="block wait">
        <p className="kicker">NO RECORD</p>
        <h2>접수 내역이 없습니다</h2>
        <p className="sec__body">이름·생년월일·전화번호·비밀번호를 다시 확인해 주세요.</p>
        <button type="button" className="btn btn--red" onClick={() => setView("form")}>
          다시 조회
        </button>
      </section>
    );
  }

  if (view === "hit" && panel === "done") {
    return <LookupRefundDone onOther={() => setView("form")} />;
  }

  if (view === "hit" && panel === "edit" && active && access) {
    return (
      <IndividualLookupEdit
        receipt={active}
        access={access}
        busy={busy}
        error={error}
        onBack={() => {
          setError("");
          setPanel("list");
        }}
        onSubmit={(body, action) => void onModify(body, action)}
      />
    );
  }

  if (view === "hit" && receipts.length > 0) {
    return (
      <>
        {error && panel !== "cancel" ? <p className="form__err">{error}</p> : null}
        {receipts.map((receipt) => (
          <IndividualReceiptCard
            key={receipt.registrationId || receipt.orderId || receipt.paymentId}
            receipt={receipt}
            name={name.trim()}
            busy={payingKey === receiptPayKey(receipt)}
            passwordBusy={passwordBusy}
            onPay={() => void onRetryPay(receipt)}
            onPassword={openPasswordChange}
            onEdit={() => {
              setError("");
              setActive(receipt);
              setPanel("edit");
            }}
            onStartGroup={() => openStartGroup(receipt)}
            startGroupEdit={lookupPersonalStartGroupEditAllowed(receipt)}
            onRefund={() => {
              setError("");
              setActive(receipt);
              setPanel("cancel");
            }}
          />
        ))}
        <div className="lookup-other">
          <button type="button" className="lookup-other__btn" onClick={() => setView("form")}>
            다른 접수건
          </button>
        </div>
        <LookupRefundModal
          open={panel === "cancel"}
          busy={busy}
          error={error}
          onClose={() => {
            if (busy) return;
            setError("");
            setPanel("list");
          }}
          onConfirm={() => void onCancel()}
        />
        <LookupPasswordModal
          open={passwordOpen}
          busy={passwordBusy}
          error={passwordError}
          identity={{ kind: "individual", name, birth, phone }}
          onClose={() => {
            if (passwordBusy) return;
            setPasswordError("");
            setPasswordOpen(false);
          }}
          onSubmit={(input) => void onChangePassword(input)}
        />
        {hasStartGroupFeature && active ? (
          <LookupStartGroupModal
            kind="individual"
            open={startGroupOpen}
            busy={startGroupBusy}
            error={startGroupError}
            receipt={active}
            onClose={() => {
              if (startGroupBusy) return;
              setStartGroupError("");
              setStartGroupOpen(false);
              setActive(null);
            }}
            onConfirm={(password, draft) => onSaveStartGroup(password, draft)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="form__head">
        <h2>개인 신청 조회</h2>
        <p className="form__note">{LOOKUP_LEAD}</p>
      </div>
      <label className="field">
        <span>이름</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>생년월일</span>
        <BirthText
          name="birth"
          autoComplete="bday"
          value={birth}
          onChange={setBirth}
          required
        />
      </label>
      <label className="field">
        <span>전화번호</span>
        <PhoneField
          name="phone"
          placeholder="휴대폰번호를 입력해주세요."
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          required
        />
      </label>
      <div className="field">
        <span>비밀번호</span>
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder="신청조회용 비밀번호 (6자 이상)"
          minLength={APPLICATION_PASSWORD_MIN}
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="form__err">{error}</p> : null}
      <LookupNav busy={busy} onBack={onBack} />
    </form>
    </>
  );
}

function GroupLookup({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const paymentHref = useAppHref("/payment");
  const [view, setView] = useState<View>("form");
  const [panel, setPanel] = useState<"list" | "edit" | "cancel" | "done">("list");
  const [busy, setBusy] = useState(false);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState<RegistrationReceipt[]>([]);
  const [active, setActive] = useState<RegistrationReceipt | null>(null);
  const [access, setAccess] = useState<OrganizationLookupRequest | null>(null);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [startGroupOpen, setStartGroupOpen] = useState(false);
  const [startGroupBusy, setStartGroupBusy] = useState(false);
  const [startGroupError, setStartGroupError] = useState("");

  useLayoutEffect(() => {
    if (view !== "hit" || panel !== "list") return;
    scrollPageTop();
    requestAnimationFrame(scrollPageTop);
  }, [view, panel]);

  function openPasswordChange() {
    setError("");
    setPasswordError("");
    setPasswordOpen(true);
  }

  function openStartGroup(receipt: RegistrationReceipt) {
    setError("");
    setStartGroupError("");
    setActive(receipt);
    setStartGroupOpen(true);
  }

  async function onChangePassword(input: LookupPasswordSubmit) {
    if (input.kind !== "group") return;
    const currentPassword = input.currentPassword;
    const newPassword = input.newPassword;
    setAccount(input.account);
    if (!hasMainApi) {
      setPasswordError("API 주소가 설정되지 않았습니다.");
      return;
    }
    const body: OrganizationLookupRequest = {
      loginId: input.account.trim(),
      password: currentPassword,
    };
    setPasswordBusy(true);
    setPasswordError("");
    try {
      const found = await lookupOrganizationRegistrations(DEFAULT_EVENT_ID, body);
      const ids = organizationPasswordTargets(Array.isArray(found) ? found : []);
      if (!ids.length) {
        setPasswordError("단체 조회용 ID·단체 비밀번호를 다시 확인해 주세요.");
        return;
      }
      const failures: string[] = [];
      for (const organizationId of ids) {
        try {
          await changeOrganizationPassword(DEFAULT_EVENT_ID, organizationId, {
            currentPassword,
            newPassword,
          });
        } catch (err) {
          failures.push(lookupErrorMessage(err, "비밀번호를 변경하지 못했습니다."));
        }
      }
      if (failures.length) {
        setPasswordError(
          failures.length === ids.length
            ? failures[0]
            : "일부 단체의 비밀번호를 바꾸지 못했습니다.",
        );
        return;
      }
      setPassword(newPassword);
      setPasswordOpen(false);
      mainToast.success("비밀번호가 변경되었습니다.");
    } catch (err) {
      setPasswordError(lookupErrorMessage(err, "비밀번호를 변경하지 못했습니다."));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const accountErr = orgAccountError(account);
    if (accountErr) {
      setError(accountErr);
      return;
    }
    const passwordErr = applicationPasswordError(password);
    if (passwordErr) {
      setError(passwordErr);
      return;
    }
    if (!hasMainApi) {
      setError("API 주소가 설정되지 않았습니다.");
      return;
    }
    const body: OrganizationLookupRequest = {
      loginId: account.trim(),
      password: password.trim(),
    };
    setBusy(true);
    setError("");
    try {
      const found = await lookupOrganizationRegistrations(DEFAULT_EVENT_ID, body);
      const rows = Array.isArray(found) ? found : [];
      setAccess(body);
      setReceipts(rows);
      setActive(null);
      setPanel("list");
      setView(rows.length ? "hit" : "miss");
    } catch (err) {
      setError(lookupErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onRetryPay(receipt: RegistrationReceipt) {
    if (!hasMainApi || !hasTossClientKey) {
      setError("결제 연동 설정이 필요합니다. env 변경 후 다시 시도해 주세요.");
      return;
    }
    if (
      !access ||
      !lookupShowPaymentButton(receipt) ||
      !receipt.paymentId ||
      !receipt.organizationId
    ) {
      setError("결제할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    const key = receiptPayKey(receipt);
    setPayingKey(key);
    setError("");
    try {
      const retried = await retryOrganizationPayment(
        DEFAULT_EVENT_ID,
        receipt.organizationId,
        receipt.paymentId,
        access,
      );
      savePendingPayment({
        registration: paymentOrderFromRetry(retried),
        customerName: (receipt.leaderName || receipt.organizationName || account).trim(),
        savedAt: Date.now(),
        fromLookup: true,
      });
      router.push(paymentHref);
    } catch (err) {
      setError(lookupErrorMessage(err, "결제를 시작하지 못했습니다."));
      if (access) {
        await reloadOrganizationAfterActionFailure(access);
      }
    } finally {
      setPayingKey(null);
    }
  }

  async function refreshOrganization(
    nextAccess: OrganizationLookupRequest,
    keep?: LookupRefreshKeep,
  ) {
    const found = await lookupOrganizationRegistrations(DEFAULT_EVENT_ID, nextAccess);
    const rows = Array.isArray(found) ? found : [];
    setAccess(nextAccess);
    setReceipts(rows);
    setView(rows.length ? "hit" : "miss");
    if (keep && rows.length) {
      const next = matchRegistrationReceipt(rows, keep.receipt);
      if (next) {
        setActive(next);
        setPanel(keep.panel);
        return;
      }
    }
    setActive(null);
    setPanel("list");
  }

  async function reloadOrganizationAfterActionFailure(
    cred: OrganizationLookupRequest,
    keep?: LookupRefreshKeep,
  ) {
    try {
      await refreshOrganization(cred, keep);
    } catch {
      /* 요청 오류 메시지 유지 */
    }
  }

  async function onModify(body: OrganizationRegistrationModifyRequest, action: LookupModifyAction) {
    if (!active?.organizationId) {
      setError("수정할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const settled = await modifyOrganizationRegistration(
        DEFAULT_EVENT_ID,
        active.organizationId,
        body,
      );
      const order = payableOrder(settled);
      if (action === "pay") {
        if (order) {
          if (!hasTossClientKey) {
            setError("결제 연동 설정이 필요합니다. env 변경 후 다시 시도해 주세요.");
            return;
          }
          savePendingPayment({
            registration: paymentOrderFromRetry(order),
            customerName: (active.leaderName || active.organizationName || account).trim(),
            savedAt: Date.now(),
            fromLookup: true,
          });
          router.push(paymentHref);
          return;
        }
        if (access && active.paymentId && lookupShowPaymentButton(active)) {
          const retried = await retryOrganizationPayment(
            DEFAULT_EVENT_ID,
            active.organizationId,
            active.paymentId,
            access,
          );
          savePendingPayment({
            registration: paymentOrderFromRetry(retried),
            customerName: (active.leaderName || active.organizationName || account).trim(),
            savedAt: Date.now(),
            fromLookup: true,
          });
          router.push(paymentHref);
          return;
        }
        setError("결제를 시작할 수 없습니다. 수정 내용은 저장되었는지 조회 화면에서 확인해 주세요.");
        await refreshOrganization(body.access);
        return;
      }
      await refreshOrganization(body.access);
      mainToast.success("수정이 완료되었습니다.");
    } catch (err) {
      setError(lookupErrorMessage(err, "접수를 수정하지 못했습니다."));
      const cred = access ?? body.access;
      if (cred) {
        await reloadOrganizationAfterActionFailure(cred);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!access || !active?.organizationId) {
      setError("환불할 접수 정보를 확인하지 못했습니다.");
      return;
    }
    const cancelTarget = active;
    setBusy(true);
    setError("");
    try {
      await cancelOrganizationRegistration(
        DEFAULT_EVENT_ID,
        active.organizationId,
        access,
      );
      setPanel("done");
    } catch (err) {
      setError(lookupErrorMessage(err, "환불을 신청하지 못했습니다."));
      await reloadOrganizationAfterActionFailure(access, {
        receipt: cancelTarget,
        panel: "cancel",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveStartGroup(
    password: string,
    items: { registrationId: string; draft: StartGroupDraft }[],
  ) {
    if (!active?.organizationId || !access) {
      setStartGroupError("조회 정보를 확인하지 못했습니다.");
      return;
    }
    setStartGroupBusy(true);
    setStartGroupError("");
    try {
      await saveOrganizationLookupStartGroups(active.organizationId, password, items);
      await refreshOrganization(access);
      setStartGroupOpen(false);
      setActive(null);
      mainToast.success("출발 그룹이 변경되었습니다.");
    } catch (err) {
      setStartGroupError(
        lookupErrorMessage(err, "출발 그룹을 저장하지 못했습니다."),
      );
    } finally {
      setStartGroupBusy(false);
    }
  }

  if (view === "miss") {
    return (
      <section className="block wait">
        <p className="kicker">NO RECORD</p>
        <h2>접수 내역이 없습니다</h2>
        <p className="sec__body">단체 조회용 ID·단체 비밀번호를 다시 확인해 주세요.</p>
        <button type="button" className="btn btn--red" onClick={() => setView("form")}>
          다시 조회
        </button>
      </section>
    );
  }

  if (view === "hit" && panel === "done") {
    return <LookupRefundDone onOther={() => setView("form")} />;
  }

  if (view === "hit" && panel === "edit" && active && access) {
    return (
      <GroupLookupEdit
        receipt={active}
        access={access}
        busy={busy}
        error={error}
        onBack={() => {
          setError("");
          setPanel("list");
        }}
        onSubmit={(body, action) => void onModify(body, action)}
      />
    );
  }

  if (view === "hit" && receipts.length > 0) {
    return (
      <>
        {error && panel !== "cancel" ? <p className="form__err">{error}</p> : null}
        {receipts.map((receipt, i) => (
          <GroupReceiptCard
            key={receipt.organizationId || receipt.orderId || receipt.paymentId || String(i)}
            receipt={receipt}
            busy={payingKey === receiptPayKey(receipt)}
            passwordBusy={passwordBusy}
            onPay={() => void onRetryPay(receipt)}
            onPassword={openPasswordChange}
            onEdit={() => {
              setError("");
              setActive(receipt);
              setPanel("edit");
            }}
            onStartGroup={() => openStartGroup(receipt)}
            startGroupEdit={lookupOrganizationStartGroupEditAllowed(receipt)}
            onRefund={() => {
              setError("");
              setActive(receipt);
              setPanel("cancel");
            }}
          />
        ))}
        <div className="lookup-other">
          <button type="button" className="lookup-other__btn" onClick={() => setView("form")}>
            다른 접수건
          </button>
        </div>
        <LookupRefundModal
          open={panel === "cancel"}
          busy={busy}
          error={error}
          onClose={() => {
            if (busy) return;
            setError("");
            setPanel("list");
          }}
          onConfirm={() => void onCancel()}
        />
        <LookupPasswordModal
          open={passwordOpen}
          busy={passwordBusy}
          error={passwordError}
          identity={{ kind: "group", account }}
          onClose={() => {
            if (passwordBusy) return;
            setPasswordError("");
            setPasswordOpen(false);
          }}
          onSubmit={(input) => void onChangePassword(input)}
        />
        {hasStartGroupFeature && active ? (
          <LookupStartGroupModal
            kind="group"
            open={startGroupOpen}
            busy={startGroupBusy}
            error={startGroupError}
            receipt={active}
            onClose={() => {
              if (startGroupBusy) return;
              setStartGroupError("");
              setStartGroupOpen(false);
              setActive(null);
            }}
            onConfirm={(password, items) => onSaveStartGroup(password, items)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="form__head">
        <h2>단체 신청 조회</h2>
        <p className="form__note">{LOOKUP_LEAD}</p>
      </div>
      <label className="field">
        <span>단체 조회용 ID</span>
        <input
          name="account"
          type="text"
          autoComplete="username"
          placeholder="5~20자, 영문·숫자·특수문자"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
        />
        <p className="field__hint">신청조회 시 사용합니다.</p>
      </label>
      <div className="field">
        <span>단체 비밀번호</span>
        <PasswordField
          value={password}
          onChange={setPassword}
          label="단체 비밀번호"
          placeholder="단체 비밀번호를 입력해주세요."
          minLength={6}
          autoComplete="current-password"
          required
        />
        <p className="field__hint">6자 이상 입력해주세요.</p>
      </div>
      {error ? <p className="form__err">{error}</p> : null}
      <LookupNav busy={busy} onBack={onBack} />
    </form>
    </>
  );
}
