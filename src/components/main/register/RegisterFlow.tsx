"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { EVENT } from "@/lib/event";
import type { ConsentId } from "@/lib/legal";
import {
  CONSENT_FIELD,
  EMPTY_DRAFT,
  GENDERS,
  SHIRT_SIZES,
  consentValues,
  courseById,
  genderLabel,
  requiredConsentsOk,
  submitEntry,
  type ApplyKind,
  type Consents,
  type CourseId,
  type EntryDraft,
  type EntryRecord,
} from "@/lib/register";
import { ApplyKindPick } from "./ApplyKindPick";
import { ConsentList } from "./ConsentList";
import { GroupFlow } from "./GroupFlow";

const STEPS = ["코스", "정보", "확인", "완료"] as const;
type Step = 0 | 1 | 2 | 3;

export function RegisterFlow() {
  const [kind, setKind] = useState<ApplyKind | "">("");
  if (!kind) {
    return (
      <ApplyKindPick heading="신청 유형을 선택하세요" onPick={setKind} />
    );
  }
  if (kind === "group") return <GroupFlow onBack={() => setKind("")} />;
  return <IndividualFlow onBack={() => setKind("")} />;
}

function IndividualFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<EntryDraft>(EMPTY_DRAFT);
  const [record, setRecord] = useState<EntryRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function patch(next: Partial<EntryDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
  }

  function pickCourse(id: CourseId) {
    patch({ courseId: id });
    setStep(1);
  }

  function onForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.name.trim()) return setError("이름을 입력하세요.");
    if (!/^\d{8}$/.test(draft.birth)) return setError("생년월일은 YYYYMMDD로 입력하세요.");
    if (!draft.gender) return setError("성별을 선택하세요.");
    if (!draft.phone.trim()) return setError("연락처를 입력하세요.");
    if (!draft.email.trim()) return setError("이메일을 입력하세요.");
    if (!draft.emergency.trim()) return setError("비상 연락처를 입력하세요.");
    if (!draft.shirt) return setError("티셔츠 사이즈를 선택하세요.");
    if (!requiredConsentsOk(draft)) return setError("필수 약관에 동의해 주세요.");
    setStep(2);
  }

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      const saved = await submitEntry(draft);
      setRecord(saved);
      setStep(3);
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
        <section className="block">
          <h2>미션을 선택하라</h2>
          <ul className="courses__grid courses__grid--stack">
            {EVENT.courses.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={
                    draft.courseId === c.id
                      ? `course course--${c.tone} is-on`
                      : `course course--${c.tone}`
                  }
                  onClick={() => pickCourse(c.id)}
                >
                  <p className="course__code">{c.code}</p>
                  <p className="course__dist">{c.distance}</p>
                  <p className="course__desc">{c.desc}</p>
                  <p className="course__desc">{c.fee}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              유형 변경
            </button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <form className="form" onSubmit={onForm}>
          <h2>참가자 정보</h2>
          {course ? (
            <p className="form__note">
              {course.code} · {course.distance} · {course.fee}
            </p>
          ) : null}
          <label className="field">
            <span>이름</span>
            <input
              name="name"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              autoComplete="name"
              required
            />
          </label>
          <label className="field">
            <span>생년월일</span>
            <input
              name="birth"
              value={draft.birth}
              onChange={(e) => patch({ birth: e.target.value.replace(/\D/g, "").slice(0, 8) })}
              inputMode="numeric"
              placeholder="YYYYMMDD"
              required
            />
          </label>
          <fieldset className="field">
            <span>성별</span>
            <div className="seg">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={draft.gender === g.id ? "is-on" : undefined}
                  onClick={() => patch({ gender: g.id })}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>연락처</span>
            <input
              name="phone"
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              autoComplete="tel"
              required
            />
          </label>
          <label className="field">
            <span>이메일</span>
            <input
              name="email"
              type="email"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>비상 연락처</span>
            <input
              name="emergency"
              value={draft.emergency}
              onChange={(e) => patch({ emergency: e.target.value })}
              required
            />
          </label>
          <fieldset className="field">
            <span>티셔츠</span>
            <div className="seg">
              {SHIRT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={draft.shirt === size ? "is-on" : undefined}
                  onClick={() => patch({ shirt: size })}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
          <ConsentList
            values={consentValues(draft)}
            onChange={(id: ConsentId, next) =>
              patch({ [CONSENT_FIELD[id]]: next } as Partial<Consents>)
            }
          />
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
              코스 변경
            </button>
            <button type="submit" className="btn btn--red">
              확인하기
            </button>
          </div>
        </form>
      ) : null}

      {step === 2 && course ? (
        <section className="block">
          <h2>접수 내용을 확인하세요</h2>
          <dl className="spec">
            <div>
              <dt>코스</dt>
              <dd>
                {course.distance} · {course.code}
                <small>{course.fee}</small>
              </dd>
            </div>
            <div>
              <dt>이름</dt>
              <dd>{draft.name}</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>{draft.birth}</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>{draft.gender ? genderLabel(draft.gender) : "—"}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{draft.phone}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{draft.email}</dd>
            </div>
            <div>
              <dt>비상 연락처</dt>
              <dd>{draft.emergency}</dd>
            </div>
            <div>
              <dt>티셔츠</dt>
              <dd>{draft.shirt}</dd>
            </div>
          </dl>
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
              수정
            </button>
            <button type="button" className="btn btn--red" onClick={onConfirm} disabled={busy}>
              {busy ? "접수 중..." : "접수하기"}
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && record && course ? (
        <section className="ticket">
          <p className="kicker">ENTRY CONFIRMED</p>
          <h2>접수가 완료되었습니다</h2>
          <p className="ticket__no">{record.orderNo}</p>
          <p className="sec__body">
            {record.name} · {course.distance} {course.code}
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