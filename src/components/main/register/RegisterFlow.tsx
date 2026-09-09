"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  EMPTY_CONSENTS,
  EMPTY_DRAFT,
  courseById,
  genderLabel,
  requiredConsentsOk,
  submitEntry,
  ticketFee,
  ticketLabel,
  type ApplyKind,
  type Consents,
  type EntryDraft,
  type EntryRecord,
} from "@/lib/register";
import { ApplyTerms } from "./ApplyTerms";
import {
  ApplyNotice,
  BirthPick,
  CoursePick,
  FeeText,
  FormRow,
  FormSec,
  GenderPick,
  ShirtPick,
  birthView,
} from "./ApplyUi";
import { GroupFlow } from "./GroupFlow";

const STEPS = ["정보", "확인", "완료"] as const;
type Step = 0 | 1 | 2;

const NOTICE = [
  "주문번호로 신청조회에서 접수 내역을 확인할 수 있습니다.",
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

export function RegisterFlow() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);

  if (!kind) {
    return (
      <ApplyTerms
        values={consents}
        onChange={setConsents}
        onPick={setKind}
      />
    );
  }
  if (kind === "group") {
    return <GroupFlow consents={consents} onBack={() => setKind("")} />;
  }
  return <IndividualFlow consents={consents} onBack={() => setKind("")} />;
}

function IndividualFlow({
  onBack,
  consents,
}: {
  onBack: () => void;
  consents: Consents;
}) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<EntryDraft>({ ...EMPTY_DRAFT, ...consents });
  const [record, setRecord] = useState<EntryRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function patch(next: Partial<EntryDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
  }

  function onForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.name.trim()) return setError("이름을 입력하세요.");
    if (!/^\d{8}$/.test(draft.birth)) return setError("생년월일을 선택하세요.");
    if (!draft.gender) return setError("성별을 선택하세요.");
    if (!draft.phone.trim()) return setError("휴대폰번호를 입력하세요.");
    if (!draft.email.trim()) return setError("이메일을 입력하세요.");
    if (!draft.courseId) return setError("참가종목을 선택하세요.");
    if (!draft.shirt) return setError("기념품을 선택하세요.");
    if (!requiredConsentsOk(draft)) return setError("필수 약관에 동의해 주세요.");
    setStep(1);
  }

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      const saved = await submitEntry(draft);
      setRecord(saved);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "접수를 완료하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const course = draft.courseId ? courseById(draft.courseId) : undefined;

  return (
    <div className="flow">
      <ol className="stepper" aria-label="신청 단계">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={i === step ? "is-on" : i < step ? "is-done" : undefined}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </li>
        ))}
      </ol>

      {error ? <p className="form__err">{error}</p> : null}

      {step === 0 ? (
        <form className="form" onSubmit={onForm}>
          <ApplyNotice lines={NOTICE} />

          <FormSec title="개인정보">
            <FormRow label="이름" required>
              <input
                type="text"
                name="name"
                placeholder="띄어쓰기 없이 입력해주세요."
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                autoComplete="name"
                required
              />
            </FormRow>
            <FormRow label="생년월일" required>
              <BirthPick value={draft.birth} onChange={(birth) => patch({ birth })} />
            </FormRow>
            <FormRow label="성별" required>
              <GenderPick
                name="gender"
                value={draft.gender}
                onChange={(gender) => patch({ gender })}
              />
            </FormRow>
          </FormSec>

          <FormSec title="연락처 정보">
            <FormRow label="휴대폰번호" required>
              <input
                type="tel"
                name="phone"
                placeholder="휴대폰번호를 입력해주세요."
                value={draft.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                autoComplete="tel"
                required
              />
            </FormRow>
            <FormRow label="이메일" required>
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력해주세요."
                value={draft.email}
                onChange={(e) => patch({ email: e.target.value })}
                autoComplete="email"
                required
              />
            </FormRow>
          </FormSec>

          <FormSec
            title="보호자 정보 (선택)"
            note="선택사항이지만, 응급 상황에 대비해 가능하면 입력해 주세요."
          >
            <FormRow label="보호자 연락처">
              <input
                type="tel"
                name="emergency"
                placeholder="보호자 연락처를 입력해주세요."
                value={draft.emergency}
                onChange={(e) => patch({ emergency: e.target.value })}
              />
            </FormRow>
          </FormSec>

          <FormSec title="신청 정보">
            <FormRow label="참가종목" required>
              <CoursePick
                value={draft.courseId}
                ticket={draft.ticket}
                onChange={(courseId, ticket) => patch({ courseId, ticket })}
              />
            </FormRow>
            <FormRow label="기념품" required>
              <ShirtPick
                value={draft.shirt}
                onChange={(shirt) => patch({ shirt })}
              />
            </FormRow>
            {draft.courseId ? (
              <FormRow label="참가비">
                <FeeText courseId={draft.courseId} ticket={draft.ticket} />
              </FormRow>
            ) : null}
          </FormSec>

          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              유형 변경
            </button>
            <button type="submit" className="btn btn--red">
              확인하기
            </button>
          </div>
        </form>
      ) : null}

      {step === 1 && course ? (
        <section className="block">
          <h2>접수 내용을 확인하세요</h2>
          <dl className="spec">
            <div>
              <dt>참가종목</dt>
              <dd>
                {course.distance} · {ticketLabel(draft.ticket)}
                <small>{ticketFee(course, draft.ticket)}</small>
              </dd>
            </div>
            <div>
              <dt>이름</dt>
              <dd>{draft.name}</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>{birthView(draft.birth)}</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>{draft.gender ? genderLabel(draft.gender) : "—"}</dd>
            </div>
            <div>
              <dt>휴대폰번호</dt>
              <dd>{draft.phone}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{draft.email}</dd>
            </div>
            <div>
              <dt>보호자 연락처</dt>
              <dd>{draft.emergency.trim() || "—"}</dd>
            </div>
            <div>
              <dt>기념품</dt>
              <dd>티셔츠 ({draft.shirt})</dd>
            </div>
          </dl>
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
              수정
            </button>
            <button type="button" className="btn btn--red" onClick={onConfirm} disabled={busy}>
              {busy ? "접수 중..." : "접수하기"}
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 && record && course ? (
        <section className="ticket">
          <p className="kicker">ENTRY CONFIRMED</p>
          <h2>접수가 완료되었습니다</h2>
          <p className="ticket__no">{record.orderNo}</p>
          <p className="sec__body">
            {record.name} · {course.distance} {ticketLabel(record.ticket)}
          </p>
          <p className="form__note">주문번호로 신청조회에서 확인할 수 있습니다.</p>
          <div className="flow__nav">
            <Link href="/lookup" className="btn btn--ghost">
              신청조회
            </Link>
            <Link href="/" className="btn btn--red">
              홈으로
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
