"use client";

import { useState } from "react";
import {
  APPLY_ALL_AGREE,
  APPLY_NOTICE_POINTS,
  APPLY_SAFETY,
  APPLY_TERMS_LEAD,
  APPLY_TERMS_TITLE,
  REGISTER_CONSENTS,
  type ConsentId,
} from "@/lib/legal";
import {
  CONSENT_FIELD,
  consentsAll,
  consentsCheckedAll,
  requiredConsentsOk,
  type ApplyKind,
  type Consents,
} from "@/lib/register";
import { LegalBlocks } from "../legal/LegalBlocks";

const OTHER_CONSENTS = REGISTER_CONSENTS.filter((item) => item.id !== "rules");

function Toggle({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="apply-terms__toggle"
      aria-expanded={open}
      onClick={onClick}
    >
      {open ? "닫기" : "전문보기"}
      <span className="apply-terms__caret" aria-hidden />
    </button>
  );
}

export function ApplyTerms({
  values,
  onChange,
  onPick,
}: {
  values: Consents;
  onChange: (next: Consents) => void;
  onPick: (kind: ApplyKind) => void;
}) {
  const [openNotice, setOpenNotice] = useState(true);
  const [open, setOpen] = useState<Partial<Record<ConsentId, boolean>>>({
    privacy: true,
  });
  const [error, setError] = useState("");

  function setOne(id: ConsentId, next: boolean) {
    onChange({ ...values, [CONSENT_FIELD[id]]: next });
    setError("");
  }

  function toggle(id: ConsentId) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function pick(kind: ApplyKind) {
    const next = { ...values, agreeRules: true };
    if (!requiredConsentsOk(next)) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }
    onChange(next);
    onPick(kind);
  }

  return (
    <div className="apply-terms">
      <header className="apply-terms__head">
        <h2>{APPLY_TERMS_TITLE}</h2>
        <p>{APPLY_TERMS_LEAD}</p>
      </header>

      <section className="apply-terms__card">
        <div className="apply-terms__row">
          <p className="apply-terms__card-title">참가자 유의사항</p>
          <Toggle open={openNotice} onClick={() => setOpenNotice((v) => !v)} />
        </div>
        {openNotice ? (
          <div className="apply-terms__detail apply-terms__detail--notice">
            <div className="apply-terms__points">
              {APPLY_NOTICE_POINTS.map((item) => (
                <div key={item.title}>
                  <p className="apply-terms__point-title">{item.title}</p>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <div className="apply-terms__points">
              <p className="apply-terms__safety-title">{APPLY_SAFETY.title}</p>
              <p>{APPLY_SAFETY.body}</p>
              <p className="apply-terms__safety-note">{APPLY_SAFETY.note}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="apply-terms__card">
        <div className="apply-terms__row">
          <label className="apply-terms__agree apply-terms__agree--all">
            <input
              type="checkbox"
              checked={consentsCheckedAll(values)}
              onChange={(e) => {
                onChange(consentsAll(e.target.checked));
                setError("");
              }}
            />
            <span>{APPLY_ALL_AGREE}</span>
          </label>
        </div>

        {OTHER_CONSENTS.map((item) => {
          const expanded = Boolean(open[item.id]);
          const checked = values[CONSENT_FIELD[item.id]];
          return (
            <div key={item.id} className="apply-terms__item">
              <div className="apply-terms__row">
                <label className="apply-terms__agree">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setOne(item.id, e.target.checked)}
                  />
                  <span>{item.title}</span>
                </label>
                <Toggle open={expanded} onClick={() => toggle(item.id)} />
              </div>
              {expanded ? (
                <div className="apply-terms__detail">
                  {item.lead ? <p>{item.lead}</p> : null}
                  <LegalBlocks nodes={item.nodes} />
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {error ? <p className="form__err">{error}</p> : null}

      <div className="apply-terms__actions">
        <button type="button" className="btn btn--red" onClick={() => pick("individual")}>
          개인신청
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => pick("group")}>
          단체신청
        </button>
      </div>
    </div>
  );
}
