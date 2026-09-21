"use client";

import { DEFAULT_EVENT_ID, hasMainApi, hasTossClientKey } from "@/lib/main/config";
import { paymentOrderFromRetry, savePendingPayment } from "@/lib/payment/session";
import { formatPhone, type ApplyKind } from "@/lib/register";
import {
  lookupIndividualRegistrations,
  lookupOrganizationRegistrations,
  retryIndividualPayment,
  retryOrganizationPayment,
} from "@/services/main/registrations";
import type {
  IndividualRegistrationLookupRequest,
  OrganizationLookupParticipant,
  OrganizationLookupRequest,
  RegistrationReceipt,
  RegistrationReceiptMember,
  RegistrationReceiptSouvenir,
} from "@/services/main/types";
import { useRouter } from "next/navigation";
import { FormEvent, useLayoutEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { ApplyKindPick } from "../register/ApplyKindPick";
import { PasswordField, PhoneField } from "../register/ApplyUi";
import { useRegistrationOpen } from "../register/useRegistrationOpen";
import { scrollPageTop } from "@/lib/scroll-page";

type View = "form" | "hit" | "miss";

const LOOKUP_LEAD =
  "신청 내역을 확인하기 위해 신청시와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.";

export function LookupPage() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  const lookupOpen = useRegistrationOpen();

  useLayoutEffect(() => {
    scrollPageTop();
  }, [kind]);

  return (
    <main className="page">
      <SideBanner kicker="INTEL" title="신청조회" en="FIND YOUR ENTRY" />
      <div className="page__body wrap wrap--narrow">
        {!lookupOpen || !kind ? (
          <ApplyKindPick
            heading="조회 유형을 선택하세요"
            lookup
            disabled={!lookupOpen}
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

function LookupNav({ busy, onBack }: { busy: boolean; onBack: () => void }) {
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

function souvenirSize(item: RegistrationReceiptSouvenir) {
  return item.size || item.selectedSize || "";
}

type ReceiptMemberView = {
  id: string;
  name: string;
  course: string;
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

function toMemberView(
  row: RegistrationReceiptMember | OrganizationLookupParticipant,
  index: number,
): ReceiptMemberView {
  return {
    id: row.registrationId || String(index),
    name: row.name ?? "",
    course: row.eventCategoryName ?? "",
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
  if (receipt.members?.length) return receipt.members.map(toMemberView);
  if (receipt.registrations?.length) return receipt.registrations.map(toMemberView);
  return [];
}

function receiptSouvenirs(receipt: RegistrationReceipt) {
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

function paymentActionNote(action?: string | null) {
  if (action === "WAIT") {
    return "결제를 확인하고 있습니다. 잠시 후 다시 조회해 주세요.";
  }
  if (action === "PAYMENT_CLOSED") return "결제 기한이 종료되었습니다.";
  if (action === "CONTACT_SUPPORT") return "운영 문의가 필요합니다.";
  return "";
}

const PAYMENT_STATUS: Record<string, { label: string; hint: string }> = {
  COMPLETED: {
    label: "결제완료",
    hint: "",
  },
  FAILED: {
    label: "결제 실패",
    hint: "결제가 완료되지 않았습니다. 다시 결제하거나 문의해 주세요.",
  },
  ADDITIONAL_PAYMENT_REQUIRED: {
    label: "추가 결제 필요",
    hint: "미납 금액이 있습니다. 결제 기한 내 결제를 완료해 주세요.",
  },
  PAYMENT_PENDING: {
    label: "결제 대기",
    hint: "결제가 아직 완료되지 않았습니다.",
  },
  READY: {
    label: "결제 대기",
    hint: "결제가 아직 완료되지 않았습니다.",
  },
  PENDING: {
    label: "결제 대기",
    hint: "결제가 아직 완료되지 않았습니다.",
  },
  CANCELED: {
    label: "결제 취소",
    hint: "이 접수의 결제가 취소되었습니다.",
  },
  CANCELLED: {
    label: "결제 취소",
    hint: "이 접수의 결제가 취소되었습니다.",
  },
  REFUNDED: {
    label: "환불완료",
    hint: "참가비가 환불되었습니다.",
  },
  REFUND_REQUESTED: {
    label: "환불 대기",
    hint: "환불이 접수되어 처리 중입니다.",
  },
  REFUND_PENDING: {
    label: "환불 대기",
    hint: "환불이 접수되어 처리 중입니다.",
  },
};

const REGISTRATION_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "확정",
  PENDING: "대기",
  PAYMENT_PENDING: "결제 대기",
  ADDITIONAL_PAYMENT_REQUIRED: "추가 결제",
  CANCELED: "취소",
  CANCELLED: "취소",
};

function paymentStatusInfo(status?: string | null, apiLabel?: string | null) {
  const key = (status ?? "").trim().toUpperCase();
  const meta = key ? PAYMENT_STATUS[key] : undefined;
  return {
    label: apiLabel?.trim() || meta?.label || (status?.trim() ? status : "—"),
    hint: meta ? meta.hint : status?.trim() ? "상태 안내는 운영 문의로 확인해 주세요." : "",
  };
}

function registrationStatusLabel(status?: string) {
  const key = (status ?? "").trim().toUpperCase();
  if (!key) return "";
  return REGISTRATION_STATUS_LABEL[key] || status || "";
}

function PaymentStatusValue({
  status,
  apiLabel,
}: {
  status?: string | null;
  apiLabel?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const info = paymentStatusInfo(status, apiLabel);
  if (!info.hint) return <>{info.label}</>;
  return (
    <>
      <span>{info.label}</span>
      <button
        type="button"
        className="status-help"
        aria-expanded={open}
        aria-label={`${info.label} 안내`}
        onClick={() => setOpen((on) => !on)}
      >
        ?
      </button>
      {open ? <small className="status-help__tip">{info.hint}</small> : null}
    </>
  );
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
      {receipt.email ? (
        <div>
          <dt>이메일</dt>
          <dd>{receipt.email}</dd>
        </div>
      ) : null}
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
        <dt>결제상태</dt>
        <dd>
          <PaymentStatusValue
            status={receipt.paymentStatus}
            apiLabel={receipt.paymentStatusLabel}
          />
        </dd>
      </div>
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

function ReceiptSouvenirList({ souvenirs }: { souvenirs: RegistrationReceiptSouvenir[] }) {
  if (!souvenirs.length) return null;
  return (
    <ul className="member-list">
      {souvenirs.map((item, i) => (
        <li key={`${item.souvenirId}-${souvenirSize(item)}-${i}`}>
          <strong>{item.name}</strong>
          <span>
            {souvenirSize(item) || "—"}
            {item.quantity > 1 ? ` · ${item.quantity}개` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReceiptMemberList({ members }: { members: ReceiptMemberView[] }) {
  if (!members.length) return null;
  const active = members.filter((member) => !member.canceled);
  const canceled = members.filter((member) => member.canceled);
  return (
    <>
      {active.length > 0 ? (
        <ul className="member-list">
          {active.map((member, i) => (
            <li key={member.id}>
              <strong>
                {String(i + 1).padStart(2, "0")} {member.name || "참가자"}
              </strong>
              <span>
                {[member.course, member.souvenirs[0]?.size, registrationStatusLabel(member.status)]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {canceled.length > 0 ? (
        <ul className="member-list">
          {canceled.map((member) => (
            <li key={member.id} className="is-canceled">
              <strong>{member.name || "참가자"}</strong>
              <span>취소</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function canPreparePayment(receipt: RegistrationReceipt) {
  return receipt.paymentAction === "PREPARE_PAYMENT" && Boolean(receipt.paymentId);
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

function ReceiptPayButton({
  receipt,
  busy,
  onPay,
}: {
  receipt: RegistrationReceipt;
  busy: boolean;
  onPay: () => void;
}) {
  if (!canPreparePayment(receipt)) return null;
  return (
    <div className="flow__nav">
      <button
        type="button"
        className="btn btn--red"
        onClick={onPay}
        disabled={busy}
      >
        {busy ? "결제 준비 중..." : "결제하기"}
      </button>
    </div>
  );
}

function ReceiptNotes({ receipt }: { receipt: RegistrationReceipt }) {
  const actionNote = paymentActionNote(receipt.paymentAction);
  return (
    <>
      {receipt.warningMessage ? (
        <p className="form__note">{receipt.warningMessage}</p>
      ) : null}
      {actionNote ? <p className="form__note">{actionNote}</p> : null}
    </>
  );
}

function IndividualReceiptCard({
  receipt,
  name,
  paying,
  onPay,
}: {
  receipt: RegistrationReceipt;
  name: string;
  paying?: boolean;
  onPay?: () => void;
}) {
  const members = receiptMembers(receipt);
  const course = members.find((member) => !member.canceled)?.course;
  return (
    <section className="ticket">
      <p className="kicker">FOUND</p>
      <h2>개인 접수 확인</h2>
      <dl className="spec">
        <div>
          <dt>이름</dt>
          <dd>{members[0]?.name || name}</dd>
        </div>
        {course ? (
          <div>
            <dt>코스</dt>
            <dd>{course}</dd>
          </div>
        ) : null}
        <ReceiptContactSpec receipt={receipt} />
        <ReceiptPaymentSpec receipt={receipt} />
      </dl>
      <ReceiptSouvenirList souvenirs={receiptSouvenirs(receipt)} />
      <ReceiptNotes receipt={receipt} />
      {onPay ? (
        <ReceiptPayButton receipt={receipt} busy={Boolean(paying)} onPay={onPay} />
      ) : null}
    </section>
  );
}

function GroupReceiptCard({
  receipt,
  paying,
  onPay,
}: {
  receipt: RegistrationReceipt;
  paying?: boolean;
  onPay?: () => void;
}) {
  const members = receiptMembers(receipt);
  const activeCount = members.filter((member) => !member.canceled).length;
  return (
    <section className="ticket">
      <p className="kicker">FOUND</p>
      <h2>단체 접수 확인</h2>
      <dl className="spec">
        <div>
          <dt>단체명</dt>
          <dd>{receipt.organizationName || "—"}</dd>
        </div>
        {receipt.leaderName ? (
          <div>
            <dt>대표자</dt>
            <dd>{receipt.leaderName}</dd>
          </div>
        ) : null}
        <div>
          <dt>인원</dt>
          <dd>{activeCount}명</dd>
        </div>
        <ReceiptContactSpec receipt={receipt} />
        <ReceiptPaymentSpec receipt={receipt} />
      </dl>
      <ReceiptMemberList members={members} />
      <ReceiptSouvenirList souvenirs={receipt.souvenirs ?? []} />
      <ReceiptNotes receipt={receipt} />
      {onPay ? (
        <ReceiptPayButton receipt={receipt} busy={Boolean(paying)} onPay={onPay} />
      ) : null}
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

function IndividualLookup({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState<RegistrationReceipt[]>([]);
  const [access, setAccess] = useState<IndividualRegistrationLookupRequest | null>(
    null,
  );
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasMainApi) {
      setError("API 주소가 설정되지 않았습니다.");
      return;
    }
    const body: IndividualRegistrationLookupRequest = {
      name: name.trim(),
      birth: toLookupBirth(birth),
      phNum: formatPhone(phone),
      password: password.trim(),
    };
    setBusy(true);
    setError("");
    try {
      const found = await lookupIndividualRegistrations(DEFAULT_EVENT_ID, body);
      const rows = Array.isArray(found) ? found : [];
      setAccess(body);
      setReceipts(rows);
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
    if (!access || !canPreparePayment(receipt) || !receipt.paymentId) {
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
        customerName: (receiptMembers(receipt)[0]?.name || name).trim(),
        savedAt: Date.now(),
      });
      router.push("/payment");
    } catch (err) {
      setError(lookupErrorMessage(err, "결제를 시작하지 못했습니다."));
    } finally {
      setPayingKey(null);
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

  if (view === "hit" && receipts.length > 0) {
    return (
      <>
        {error ? <p className="form__err">{error}</p> : null}
        {receipts.map((receipt) => (
          <IndividualReceiptCard
            key={receipt.registrationId || receipt.orderId || receipt.paymentId}
            receipt={receipt}
            name={name.trim()}
            paying={payingKey === receiptPayKey(receipt)}
            onPay={() => void onRetryPay(receipt)}
          />
        ))}
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={() => setView("form")}>
            다른 접수건
          </button>
        </div>
      </>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
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
        <input
          name="birth"
          type="text"
          inputMode="numeric"
          placeholder="YYYYMMDD"
          autoComplete="bday"
          value={birth}
          onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 8))}
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
          placeholder="신청조회용 비밀번호 (4자 이상)"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="form__err">{error}</p> : null}
      <LookupNav busy={busy} onBack={onBack} />
    </form>
  );
}

function GroupLookup({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState<RegistrationReceipt[]>([]);
  const [access, setAccess] = useState<OrganizationLookupRequest | null>(null);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    if (!access || !canPreparePayment(receipt) || !receipt.paymentId || !receipt.organizationId) {
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
      });
      router.push("/payment");
    } catch (err) {
      setError(lookupErrorMessage(err, "결제를 시작하지 못했습니다."));
    } finally {
      setPayingKey(null);
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

  if (view === "hit" && receipts.length > 0) {
    return (
      <>
        {error ? <p className="form__err">{error}</p> : null}
        {receipts.map((receipt, i) => (
          <GroupReceiptCard
            key={receipt.organizationId || receipt.orderId || receipt.paymentId || String(i)}
            receipt={receipt}
            paying={payingKey === receiptPayKey(receipt)}
            onPay={() => void onRetryPay(receipt)}
          />
        ))}
        <div className="flow__nav">
          <button type="button" className="btn btn--ghost" onClick={() => setView("form")}>
            다른 접수건
          </button>
        </div>
      </>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
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
        <p className="field__hint">6~64자, 공백 없이 입력해주세요.</p>
      </div>
      {error ? <p className="form__err">{error}</p> : null}
      <LookupNav busy={busy} onBack={onBack} />
    </form>
  );
}
