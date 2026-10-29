"use client";

import { FormEvent, useState } from "react";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

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
          <form className="inquiry-secret__form--stack" onSubmit={onSubmit}>
            <label className="inquiry-secret__field">
              <span>배번호</span>
              <span className="inquiry-secret__control">
                <input
                  id="vr-bib"
                  name="bib"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                />
              </span>
            </label>
            <label className="inquiry-secret__field">
              <span>휴대폰 번호</span>
              <span className="inquiry-secret__control">
                <input
                  id="vr-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01012345678"
                  required
                />
              </span>
            </label>
            {!sent ? (
              <button type="submit" className="btn btn--red">
                인증번호 받기
              </button>
            ) : (
              <>
                <label className="inquiry-secret__field">
                  <span>인증번호</span>
                  <span className="inquiry-secret__control">
                    <input id="vr-code" name="code" inputMode="numeric" maxLength={6} required />
                  </span>
                </label>
                <button type="submit" className="btn btn--red">
                  로그인
                </button>
                <p className="vr-form-note">SMS API 연동 전 UI 골격입니다.</p>
              </>
            )}
          </form>
          <p className="vr-form-note vr-stack-top">
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
