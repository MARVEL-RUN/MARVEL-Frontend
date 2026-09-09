"use client";

import { FormEvent, useState } from "react";
import {
  courseById,
  genderLabel,
  lookupEntry,
  lookupGroup,
  ticketLabel,
  type ApplyKind,
  type EntryRecord,
  type GroupRecord,
} from "@/lib/register";
import { SideBanner } from "../layout/SideBanner";
import { ApplyKindPick } from "../register/ApplyKindPick";

type View = "form" | "hit" | "miss";

export function LookupPage() {
  const [kind, setKind] = useState<ApplyKind | "">("");

  return (
    <main className="page">
      <SideBanner kicker="INTEL" title="신청조회" en="FIND YOUR ENTRY" />
      <div className="page__body wrap wrap--narrow">
        {!kind ? (
          <ApplyKindPick heading="조회 유형을 선택하세요" lookup onPick={setKind} />
        ) : kind === "group" ? (
          <GroupLookup onBack={() => setKind("")} />
        ) : (
          <IndividualLookup onBack={() => setKind("")} />
        )}
      </div>
    </main>
  );
}

function IndividualLookup({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<EntryRecord | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const found = await lookupEntry({
        name: String(data.get("name") ?? ""),
        birth: String(data.get("birth") ?? ""),
        orderNo: String(data.get("order") ?? ""),
      });
      setRecord(found);
      setView(found ? "hit" : "miss");
    } finally {
      setBusy(false);
    }
  }

  const course = record ? courseById(record.courseId) : undefined;

  if (view === "miss") {
    return (
      <section className="block wait">
        <p className="kicker">NO RECORD</p>
        <h2>접수 내역이 없습니다</h2>
        <p className="sec__body">이름·생년월일·주문번호를 다시 확인해 주세요.</p>
        <button type="button" className="btn btn--red" onClick={() => setView("form")}>
          다시 조회
        </button>
      </section>
    );
  }

  if (view === "hit" && record && course) {
    return (
      <section className="ticket">
        <p className="kicker">FOUND</p>
        <h2>개인 접수 확인</h2>
        <p className="ticket__no">{record.orderNo}</p>
        <dl className="spec">
          <div>
            <dt>이름</dt>
            <dd>{record.name}</dd>
          </div>
          <div>
            <dt>코스</dt>
            <dd>
              {course.distance} · {course.code}
              {record.ticket === "child" ? " · 어린이" : ""}
            </dd>
          </div>
          <div>
            <dt>티셔츠</dt>
            <dd>{record.shirt}</dd>
          </div>
        </dl>
        <button type="button" className="btn btn--ghost" onClick={() => setView("form")}>
          다른 접수건
        </button>
      </section>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>개인 신청 조회</h2>
      <label className="field">
        <span>이름</span>
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label className="field">
        <span>생년월일</span>
        <input name="birth" type="text" inputMode="numeric" placeholder="YYYYMMDD" required />
      </label>
      <label className="field">
        <span>주문번호</span>
        <input name="order" type="text" placeholder="MR26-10K-12345" required />
      </label>
      <div className="flow__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          유형 변경
        </button>
        <button type="submit" className="btn btn--red" disabled={busy}>
          {busy ? "조회 중..." : "조회"}
        </button>
      </div>
      <p className="form__note">개인 접수 시 발급된 주문번호로 조회합니다.</p>
    </form>
  );
}

function GroupLookup({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<GroupRecord | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const found = await lookupGroup({
        groupName: String(data.get("group") ?? ""),
        leaderName: String(data.get("leader") ?? ""),
        orderNo: String(data.get("order") ?? ""),
      });
      setRecord(found);
      setView(found ? "hit" : "miss");
    } finally {
      setBusy(false);
    }
  }

  if (view === "miss") {
    return (
      <section className="block wait">
        <p className="kicker">NO RECORD</p>
        <h2>접수 내역이 없습니다</h2>
        <p className="sec__body">단체명·대표자·주문번호를 다시 확인해 주세요.</p>
        <button type="button" className="btn btn--red" onClick={() => setView("form")}>
          다시 조회
        </button>
      </section>
    );
  }

  if (view === "hit" && record) {
    return (
      <section className="ticket">
        <p className="kicker">FOUND</p>
        <h2>단체 접수 확인</h2>
        <p className="ticket__no">{record.orderNo}</p>
        <dl className="spec">
          <div>
            <dt>단체명</dt>
            <dd>{record.groupName}</dd>
          </div>
          <div>
            <dt>대표자</dt>
            <dd>{record.leaderName}</dd>
          </div>
          <div>
            <dt>인원</dt>
            <dd>{record.participants.length}명</dd>
          </div>
        </dl>
        <ul className="member-list">
          {record.participants.map((p, i) => {
            const course = courseById(p.courseId);
            return (
              <li key={`${p.name}-${i}`}>
                <strong>
                  {String(i + 1).padStart(2, "0")} {p.name}
                </strong>
                <span>
                  {course
                    ? `${course.distance} · ${ticketLabel(p.ticket)}`
                    : "—"}{" "}
                  · {genderLabel(p.gender)} · {p.shirt}
                </span>
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn--ghost" onClick={() => setView("form")}>
          다른 접수건
        </button>
      </section>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>단체 신청 조회</h2>
      <label className="field">
        <span>단체명</span>
        <input name="group" type="text" required />
      </label>
      <label className="field">
        <span>대표자 성명</span>
        <input name="leader" type="text" required />
      </label>
      <label className="field">
        <span>주문번호</span>
        <input name="order" type="text" placeholder="MR26-GRP-12345" required />
      </label>
      <div className="flow__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          유형 변경
        </button>
        <button type="submit" className="btn btn--red" disabled={busy}>
          {busy ? "조회 중..." : "조회"}
        </button>
      </div>
      <p className="form__note">단체 접수 시 발급된 주문번호로 조회합니다.</p>
    </form>
  );
}
