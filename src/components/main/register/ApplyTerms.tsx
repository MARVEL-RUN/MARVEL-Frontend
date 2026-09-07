"use client";

import { useState } from "react";
import { EVENT } from "@/lib/event";
import {
  APPLY_ALL_AGREE,
  APPLY_NOTICE_POINTS,
  APPLY_SAFETY,
  OFFICE,
  PARTICIPANT_NOTICE,
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

const RULES = REGISTER_CONSENTS.find((item) => item.id === "rules");
const OTHER_CONSENTS = REGISTER_CONSENTS.filter((item) => item.id !== "rules");

export function ApplyTerms({
  values,
  onChange,
  onPick,
}: {
  values: Consents;
  onChange: (next: Consents) => void;
  onPick: (kind: ApplyKind) => void;
}) {
  const [open, setOpen] = useState<ConsentId | null>(null);
  const [error, setError] = useState("");

  function setOne(id: ConsentId, next: boolean) {
    onChange({ ...values, [CONSENT_FIELD[id]]: next });
    setError("");
  }

  function pick(kind: ApplyKind) {
    if (!requiredConsentsOk(values)) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }
    onPick(kind);
  }

  return (
    <div className="apply-terms">
      <p className="apply-terms__lead">
        나는 {EVENT.title}에 참가하면서, {OFFICE.name}이 규정하는 참가자
        동의사항에 대해 다음과 같이 동의하고 확인합니다.
      </p>

      <section className="apply-terms__panel">
        <h2>참가자 유의사항</h2>
        <div className="apply-terms__points">
          {APPLY_NOTICE_POINTS.map((item) => (
            <div key={item.title}>
              <p className="apply-terms__point-title">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="apply-terms__panel">
        <h2>약관</h2>

        <label className="check apply-terms__all">
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

        {RULES ? (
          <label className="check apply-terms__item">
            <input
              type="checkbox"
              checked={values.agreeRules}
              onChange={(e) => setOne("rules", e.target.checked)}
            />
            <em className="apply-terms__badge">필수</em>
            <span>[대회신청 약관 안내 동의]</span>
          </label>
        ) : null}

        <div className="apply-terms__safety">
          <p className="apply-terms__safety-title">{APPLY_SAFETY.title}</p>
          <p>{APPLY_SAFETY.body}</p>
          <p className="apply-terms__safety-note">{APPLY_SAFETY.note}</p>
        </div>

        <p className="apply-terms__caption">참가 신청 약관 안내</p>
        <div className="apply-terms__scroll">
          {PARTICIPANT_NOTICE.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <LegalBlocks nodes={section.nodes} />
            </section>
          ))}
        </div>

        <ul className="apply-terms__list">
          {OTHER_CONSENTS.map((item) => {
            const expanded = open === item.id;
            const checked = values[CONSENT_FIELD[item.id]];
            return (
              <li key={item.id}>
                <div className="apply-terms__row">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setOne(item.id, e.target.checked)}
                    />
                    <em
                      className={
                        item.required
                          ? "apply-terms__badge"
                          : "apply-terms__badge apply-terms__badge--opt"
                      }
                    >
                      {item.required ? "필수" : "선택"}
                    </em>
                    <span>{item.title}</span>
                  </label>
                  <button
                    type="button"
                    className="apply-terms__view"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : item.id)}
                  >
                    {expanded ? "닫기" : "보기"}
                  </button>
                </div>
                {expanded ? (
                  <div className="apply-terms__detail">
                    {item.lead ? <p className="sec__body">{item.lead}</p> : null}
                    <LegalBlocks nodes={item.nodes} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
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
