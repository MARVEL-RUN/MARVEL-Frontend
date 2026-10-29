"use client";

import { FormEvent, useState } from "react";
import { VrLink } from "./VrLink";
import { VirtualRunSubPage } from "./VirtualRunSubPage";

export function VirtualRunLoginPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <VirtualRunSubPage kicker="LOGIN" title="로그인" en="BIB · SMS">
      <section className="guide-sec">
        <div className="wrap wrap--narrow">
          <p className="page__body vr-page-lead">
            회원가입 없이 배번호와 휴대폰 문자 인증으로 로그인합니다.
          </p>
          <form className="vr-form" onSubmit={onSubmit}>
            <div className="vr-field">
              <label htmlFor="vr-bib">배번호</label>
              <input id="vr-bib" name="bib" inputMode="numeric" autoComplete="off" required />
            </div>
            <div className="vr-field">
              <label htmlFor="vr-phone">휴대폰 번호</label>
              <input
                id="vr-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01012345678"
                required
              />
            </div>
            {!sent ? (
              <button type="submit" className="btn btn--red">
                인증번호 받기
              </button>
            ) : (
              <>
                <div className="vr-field">
                  <label htmlFor="vr-code">인증번호</label>
                  <input id="vr-code" name="code" inputMode="numeric" maxLength={6} required />
                </div>
                <button type="submit" className="btn btn--red">
                  로그인
                </button>
                <p className="vr-hint">SMS API 연동 전 UI 골격입니다.</p>
              </>
            )}
          </form>
          <p className="vr-hint vr-stack-top">
            티켓이 없으신가요?{" "}
            <VrLink href="/tickets" className="vr-inline-link">
              티켓 구매
            </VrLink>
          </p>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
