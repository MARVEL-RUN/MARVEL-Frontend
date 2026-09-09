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
  ticketFee,
  ticketLabel,
  type Consents,
  type CourseId,
  type Gender,
  type GroupDraft,
  type GroupRecord,
  type ParticipantDraft,
  type ShirtSize,
  type TicketKind,
} from "@/lib/register";
import {
  ApplyHint,
  ApplyNotice,
  BirthText,
  FormRow,
  FormSec,
  PhoneField,
  birthView,
} from "./ApplyUi";

const STEPS = ["정보", "확인", "완료"] as const;
type Step = 0 | 1 | 2;

const NOTICE = [
  `한 번에 최대 ${MAX_GROUP_SIZE}명까지 신청할 수 있습니다. 초과 인원은 별도 단체로 신청하세요.`,
  "[개인 신청 후, 단체 전환 불가] 단체 참가시 반드시 단체로 신청하시기 바랍니다.",
];

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
    patch({
      participants: [...draft.participants, { ...EMPTY_PARTICIPANT }],
    });
  }

  function removeMember(i: number) {
    if (draft.participants.length <= 1) return;
    patch({ participants: draft.participants.filter((_, idx) => idx !== i) });
  }

  function onForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.groupName.trim()) return setError("단체명을 입력하세요.");
    if (!draft.leaderName.trim()) return setError("대표자 성명을 입력하세요.");
    if (!draft.phone.trim()) return setError("휴대폰번호를 입력하세요.");
    if (!draft.email.trim()) return setError("이메일을 입력하세요.");
    try {
      draft.participants.forEach((p, i) => {
        const n = i + 1;
        if (!p.name.trim()) throw new Error(`참가자 ${n}: 이름을 입력하세요.`);
        if (!/^\d{8}$/.test(p.birth)) {
          throw new Error(`참가자 ${n}: 생년월일을 입력하세요.`);
        }
        if (!p.phone.trim()) throw new Error(`참가자 ${n}: 연락처를 입력하세요.`);
        if (!p.gender) throw new Error(`참가자 ${n}: 성별을 선택하세요.`);
        if (!p.courseId) throw new Error(`참가자 ${n}: 참가종목을 선택하세요.`);
        if (!p.shirt) throw new Error(`참가자 ${n}: 기념품을 선택하세요.`);
      });
    } catch (err) {
      return setError(err instanceof Error ? err.message : "참가자 정보를 확인하세요.");
    }
    if (!requiredConsentsOk(draft)) return setError("필수 약관에 동의해 주세요.");
    setStep(1);
  }

  async function onConfirm() {
    setBusy(true);
    setError("");
    try {
      setRecord(await submitGroup(draft));
      setStep(2);
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
        <form className="form" onSubmit={onForm}>
          <ApplyNotice lines={NOTICE} />

          <FormSec title="단체 정보">
            <FormRow label="단체명" required>
              <input
                type="text"
                placeholder="단체명을 띄어쓰기 없이 입력해주세요"
                value={draft.groupName}
                onChange={(e) => patch({ groupName: e.target.value })}
                required
              />
            </FormRow>
            <FormRow label="대표자 성명" required>
              <input
                type="text"
                placeholder="대표자 성명을 입력해주세요"
                value={draft.leaderName}
                onChange={(e) => patch({ leaderName: e.target.value })}
                required
              />
            </FormRow>
          </FormSec>

          <FormSec title="연락처 정보">
            <FormRow label="휴대폰번호" required>
              <PhoneField
                placeholder="휴대폰번호를 입력해주세요."
                value={draft.phone}
                onChange={(phone) => patch({ phone })}
                autoComplete="tel"
                required
              />
            </FormRow>
            <FormRow label="이메일" required>
              <input
                type="email"
                placeholder="이메일을 입력해주세요."
                value={draft.email}
                onChange={(e) => patch({ email: e.target.value })}
                autoComplete="email"
                required
              />
            </FormRow>
          </FormSec>

          <FormSec title="참가자">
            <ApplyHint>
              <p>대표자도 대회에 참여하는 경우 아래 참가자 정보를 작성하시기 바랍니다.</p>
              <p>
                {`*(한번에 최대 ${MAX_GROUP_SIZE}명까지만 신청 가능하며, 초과 인원은 별도의 단체로 신청 해주시기 바랍니다.)`}
              </p>
            </ApplyHint>
            <div className="party-bar">
              <p>{draft.participants.length}명 등록</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={addMember}
                disabled={draft.participants.length >= MAX_GROUP_SIZE}
              >
                참가자 추가
              </button>
            </div>
            <div className="party-wrap">
              <table className="party">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>생년월일</th>
                    <th>연락처</th>
                    <th>성별</th>
                    <th>참가종목</th>
                    <th>기념품</th>
                    <th>참가비</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.participants.map((p, i) => {
                    const course = p.courseId ? courseById(p.courseId) : undefined;
                    return (
                      <tr key={i}>
                        <td className="party__no">{i + 1}.</td>
                        <td>
                          <input
                            type="text"
                            placeholder="성명"
                            value={p.name}
                            onChange={(e) => patchMember(i, { name: e.target.value })}
                            required
                          />
                        </td>
                        <td>
                          <BirthText
                            value={p.birth}
                            onChange={(birth) => patchMember(i, { birth })}
                          />
                        </td>
                        <td>
                          <PhoneField
                            placeholder="연락처"
                            value={p.phone}
                            onChange={(phone) => patchMember(i, { phone })}
                            required
                          />
                        </td>
                        <td>
                          <select
                            value={p.gender}
                            onChange={(e) =>
                              patchMember(i, { gender: e.target.value as Gender })
                            }
                            required
                          >
                            <option value="">성별</option>
                            {GENDERS.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={
                              p.courseId ? `${p.courseId}:${p.ticket}` : ""
                            }
                            onChange={(e) => {
                              if (!e.target.value) {
                                patchMember(i, {
                                  courseId: "",
                                  ticket: "adult",
                                });
                                return;
                              }
                              const [courseId, ticket] = e.target.value.split(
                                ":",
                              ) as [CourseId, TicketKind];
                              patchMember(i, { courseId, ticket });
                            }}
                            required
                          >
                            <option value="">참가종목</option>
                            {EVENT.courses.flatMap((c) => {
                              const adult = (
                                <option
                                  key={`${c.id}-adult`}
                                  value={`${c.id}:adult`}
                                >
                                  {c.distance} 성인
                                </option>
                              );
                              if (!("childFee" in c)) return [adult];
                              return [
                                adult,
                                <option
                                  key={`${c.id}-child`}
                                  value={`${c.id}:child`}
                                >
                                  {c.distance} 어린이
                                </option>,
                              ];
                            })}
                          </select>
                        </td>
                        <td>
                          <select
                            value={p.shirt}
                            onChange={(e) =>
                              patchMember(i, { shirt: e.target.value as ShirtSize })
                            }
                            required
                          >
                            <option value="">기념품</option>
                            {SHIRT_SIZES.map((size) => (
                              <option key={size} value={size}>
                                티셔츠 ({size})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="party__fee">
                          {course ? ticketFee(course, p.ticket) : "—"}
                        </td>
                        <td className="party__del">
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            disabled={draft.participants.length <= 1}
                            aria-label="참가자 삭제"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="party-sum">합계 {formatFee(total)}</p>
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

      {step === 1 ? (
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
              <dt>휴대폰번호</dt>
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
                    {course
                      ? `${course.distance} · ${ticketLabel(p.ticket)}`
                      : "—"}{" "}
                    · {birthView(p.birth)} · {p.gender ? genderLabel(p.gender) : "—"} ·{" "}
                    티셔츠 ({p.shirt}) · {p.phone}
                  </span>
                </li>
              );
            })}
          </ul>
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

      {step === 2 && record ? (
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
