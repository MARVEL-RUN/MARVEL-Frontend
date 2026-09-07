"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { EVENT } from "@/lib/event";
import {
  EMPTY_GROUP,
  EMPTY_PARTICIPANT,
  GENDERS,
  MAX_GROUP_SIZE,
  SHIRT_SIZES,
  courseById,
  formatFee,
  genderLabel,
  groupFee,
  requiredConsentsOk,
  submitGroup,
  type Consents,
  type CourseId,
  type GroupDraft,
  type GroupRecord,
  type ParticipantDraft,
} from "@/lib/register";

const STEPS = ["단체", "인원", "확인", "완료"] as const;
type Step = 0 | 1 | 2 | 3;

export function GroupFlow({
  onBack,
  consents,
}: {
  onBack: () => void;
  consents: Consents;
}) {
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<GroupDraft>({ ...EMPTY_GROUP, ...consents });
  const [record, setRecord] = useState<GroupRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function patch(next: Partial<GroupDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
    setError("");
  }

  function patchMember(i: number, next: Partial<ParticipantDraft>) {
    setDraft((prev) => ({
      ...prev,
      participants: prev.participants.map((p, idx) =>
        idx === i ? { ...p, ...next } : p,
      ),
    }));
    setError("");
  }

  function addMember() {
    if (draft.participants.length >= MAX_GROUP_SIZE) {
      setError(`한 번에 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다.`);
      return;
    }
    patch({ participants: [...draft.participants, { ...EMPTY_PARTICIPANT }] });
  }

  function removeMember(i: number) {
    if (draft.participants.length <= 1) return;
    patch({ participants: draft.participants.filter((_, idx) => idx !== i) });
  }

  function onGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.groupName.trim()) return setError("단체명을 입력하세요.");
    if (!draft.leaderName.trim()) return setError("대표자 성명을 입력하세요.");
    if (!draft.phone.trim()) return setError("대표 연락처를 입력하세요.");
    if (!draft.email.trim()) return setError("이메일을 입력하세요.");
    setStep(1);
  }

  function onMembers(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      draft.participants.forEach((p, i) => {
        const n = i + 1;
        if (!p.courseId) throw new Error(`참가자 ${n}: 코스를 선택하세요.`);
        if (!p.name.trim()) throw new Error(`참가자 ${n}: 이름을 입력하세요.`);
        if (!/^\d{8}$/.test(p.birth)) {
          throw new Error(`참가자 ${n}: 생년월일은 YYYYMMDD로 입력하세요.`);
        }
        if (!p.gender) throw new Error(`참가자 ${n}: 성별을 선택하세요.`);
        if (!p.phone.trim()) throw new Error(`참가자 ${n}: 연락처를 입력하세요.`);
        if (!p.shirt) throw new Error(`참가자 ${n}: 티셔츠 사이즈를 선택하세요.`);
      });
    } catch (err) {
      return setError(err instanceof Error ? err.message : "참가자 정보를 확인하세요.");
    }
    if (!requiredConsentsOk(draft)) return setError("필수 약관에 동의해 주세요.");
    setStep(2);
  }

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      setRecord(await submitGroup(draft));
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "접수를 완료하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const total = groupFee(draft);

  return (
    <div className="flow">
      <ol className="stepper" aria-label="단체 신청 단계">
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
        <form className="form" onSubmit={onGroup}>
          <h2>단체 정보</h2>
          <p className="form__note">
            대표자는 신청을 관리합니다. 본인도 달리는 경우 다음 단계에서 참가자로
            등록하세요.
          </p>
          <label className="field">
            <span>단체명</span>
            <input
              value={draft.groupName}
              onChange={(e) => patch({ groupName: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>대표자 성명</span>
            <input
              value={draft.leaderName}
              onChange={(e) => patch({ leaderName: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>대표 연락처</span>
            <input
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              autoComplete="tel"
              required
            />
          </label>
          <label className="field">
            <span>이메일</span>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
              required
            />
          </label>
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              유형 변경
            </button>
            <button type="submit" className="btn btn--red">
              다음
            </button>
          </div>
        </form>
      ) : null}

      {step === 1 ? (
        <form className="form" onSubmit={onMembers}>
          <h2>참가자</h2>
          <p className="form__note">
            {`한 번에 최대 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다. 초과 인원은 별도 단체로 신청하세요.`}
          </p>
          {draft.participants.map((p, i) => (
            <article key={i} className="member">
              <header className="member__head">
                <h3>참가자 {String(i + 1).padStart(2, "0")}</h3>
                {draft.participants.length > 1 ? (
                  <button type="button" onClick={() => removeMember(i)}>
                    삭제
                  </button>
                ) : null}
              </header>
              <fieldset className="field">
                <span>코스</span>
                <div className="seg">
                  {EVENT.courses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={p.courseId === c.id ? "is-on" : undefined}
                      onClick={() => patchMember(i, { courseId: c.id as CourseId })}
                    >
                      {c.distance}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>이름</span>
                <input
                  value={p.name}
                  onChange={(e) => patchMember(i, { name: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>생년월일</span>
                <input
                  value={p.birth}
                  onChange={(e) =>
                    patchMember(i, {
                      birth: e.target.value.replace(/\D/g, "").slice(0, 8),
                    })
                  }
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
                      className={p.gender === g.id ? "is-on" : undefined}
                      onClick={() => patchMember(i, { gender: g.id })}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>연락처</span>
                <input
                  value={p.phone}
                  onChange={(e) => patchMember(i, { phone: e.target.value })}
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
                      className={p.shirt === size ? "is-on" : undefined}
                      onClick={() => patchMember(i, { shirt: size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            </article>
          ))}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={addMember}
            disabled={draft.participants.length >= MAX_GROUP_SIZE}
          >
            참가자 추가
          </button>
          <p className="form__note">합계 {formatFee(total)}</p>
          <div className="flow__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
              이전
            </button>
            <button type="submit" className="btn btn--red">
              확인하기
            </button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <section className="block">
          <h2>접수 내용을 확인하세요</h2>
          <dl className="spec">
            <div>
              <dt>단체명</dt>
              <dd>{draft.groupName}</dd>
            </div>
            <div>
              <dt>대표자</dt>
              <dd>{draft.leaderName}</dd>
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
              <dt>인원</dt>
              <dd>{draft.participants.length}명</dd>
            </div>
            <div>
              <dt>합계</dt>
              <dd>{formatFee(total)}</dd>
            </div>
          </dl>
          <ul className="member-list">
            {draft.participants.map((p, i) => {
              const course = p.courseId ? courseById(p.courseId) : undefined;
              return (
                <li key={`${p.name}-${i}`}>
                  <strong>
                    {String(i + 1).padStart(2, "0")} {p.name}
                  </strong>
                  <span>
                    {course ? `${course.distance} · ${course.code}` : "—"} ·{" "}
                    {p.gender ? genderLabel(p.gender) : "—"} · {p.shirt} · {p.phone}
                  </span>
                </li>
              );
            })}
          </ul>
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

      {step === 3 && record ? (
        <section className="ticket">
          <p className="kicker">SQUAD CONFIRMED</p>
          <h2>단체 접수가 완료되었습니다</h2>
          <p className="ticket__no">{record.orderNo}</p>
          <p className="sec__body">
            {record.groupName} · {record.participants.length}명 · {formatFee(total)}
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
