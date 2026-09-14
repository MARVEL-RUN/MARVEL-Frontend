"use client";

import { FormEvent, useState } from "react";
import {
  courseById,
  genderLabel,
  lookupEntry,
  lookupGroup,
  type ApplyKind,
  type EntryRecord,
  type GroupRecord,
} from "@/lib/register";
import { SideBanner } from "../layout/SideBanner";
import { ApplyKindPick } from "../register/ApplyKindPick";
import { PasswordField, PhoneField } from "../register/ApplyUi";

type View = "form" | "hit" | "miss";

const LOOKUP_LEAD =
  "신청 내역을 확인하기 위해 신청시와 동일한 정보를 입력한 후, 확인하기를 클릭하세요.";

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

function IndividualLookup({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<EntryRecord | null>(null);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const found = await lookupEntry({ name, birth, phone, password });
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
        <p className="sec__body">이름·생년월일·전화번호·비밀번호를 다시 확인해 주세요.</p>
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
      <div className="form__head">
        <h2>개인 신청 조회</h2>
        <p className="form__sub">개인 참가자 정보</p>
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
      <LookupNav busy={busy} onBack={onBack} />
    </form>
  );
}

function GroupLookup({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("form");
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<GroupRecord | null>(null);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const found = await lookupGroup({ account, password });
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
        <p className="sec__body">단체 조회용 ID·단체 비밀번호를 다시 확인해 주세요.</p>
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
          {record.participants.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <strong>
                {String(i + 1).padStart(2, "0")} {p.name}
              </strong>
              <span>
                {p.selectedSize || "—"} · {genderLabel(p.gender)}
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--ghost" onClick={() => setView("form")}>
          다른 접수건
        </button>
      </section>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="form__head">
        <h2>단체 신청 조회</h2>
        <p className="form__sub">단체 참가자 정보</p>
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
      <LookupNav busy={busy} onBack={onBack} />
    </form>
  );
}
