"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BirthText, PasswordField, PhoneField } from "@/components/main/register/ApplyUi";
import { hasMainApi, VIRTUAL_RUN_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import { applicationPasswordError } from "@/lib/register";
import { writeLoginSession } from "@/lib/virtual-run/login-session";
import { participantFromLookup } from "@/lib/virtual-run/participant";
import { lookupIndividualRegistrations } from "@/services/main/registrations";
import type {
  IndividualRegistrationLookupRequest,
  RegistrationReceipt,
} from "@/services/main/types";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink, useVrPath } from "../layout/VrLink";

function toLookupBirth(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function loginFormError(name: string, birth: string, phone: string, password: string) {
  if (!name.trim()) return "이름을 입력하세요.";
  if (birth.replace(/\D/g, "").length !== 8) return "생년월일을 입력하세요.";
  if (phone.replace(/\D/g, "").length < 10) return "전화번호를 입력하세요.";
  return applicationPasswordError(password);
}

function loginErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "신청 내역을 조회하지 못했습니다.";
  const message = err.message.trim();
  if (!message || message.length > 180) return "신청 내역을 조회하지 못했습니다.";
  if (err instanceof MainHttpError && err.status >= 500) return "신청 내역을 조회하지 못했습니다.";
  return message;
}

function pickReceipt(rows: RegistrationReceipt[]) {
  return rows.find((row) => row.registrationId?.trim()) ?? rows[0] ?? null;
}

export function VirtualRunLoginPage() {
  const router = useRouter();
  const toHref = useVrPath();
  const { update } = useVirtualRunParticipant();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const invalid = loginFormError(name, birth, phone, password);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!hasMainApi || !VIRTUAL_RUN_EVENT_ID) {
      setError("API 주소가 설정되지 않았습니다.");
      return;
    }

    const body: IndividualRegistrationLookupRequest = {
      name: name.trim(),
      birth: toLookupBirth(birth),
      phNum: phone.replace(/\D/g, ""),
      password: password.trim(),
    };
    setBusy(true);
    try {
      const found = await lookupIndividualRegistrations(VIRTUAL_RUN_EVENT_ID, body);
      const rows = Array.isArray(found) ? found : [];
      const receipt = pickReceipt(rows);
      if (!receipt) {
        setError("이름·생년월일·전화번호·비밀번호를 다시 확인해 주세요.");
        return;
      }
      const displayName = receipt.name?.trim() || body.name;
      writeLoginSession({
        access: body,
        registrationId: receipt.registrationId?.trim() || "",
        categoryName: receipt.eventCategoryName?.trim() || "",
        eventCategoryId: receipt.eventCategoryId?.trim() || "",
      });
      update(
        participantFromLookup({
          name: displayName,
          phone: body.phNum,
          categoryName: receipt.eventCategoryName,
        }),
      );
      router.push(toHref("/mypage"));
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <VirtualRunSubPage kicker="LOGIN" title="참가자 로그인" en="NAME · BIRTH">
      <div className="page__body wrap wrap--narrow">
        <form className="form vr-login" onSubmit={onSubmit} noValidate>
          <header className="form__head">
            <h2>참가자 로그인</h2>
            <p className="form__note">
              회원가입 없이, 티켓 신청 때 입력한 이름·생년월일·전화번호·비밀번호로 로그인합니다.
            </p>
          </header>

          <label className="field">
            <span>이름</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field">
            <span>생년월일</span>
            <BirthText
              name="birth"
              autoComplete="bday"
              value={birth}
              onChange={setBirth}
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
            />
          </label>

          <div className="field">
            <span>비밀번호</span>
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder="신청 시 설정한 비밀번호 (6자 이상)"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <p className="form__err" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flow__nav">
            <button type="submit" className="btn btn--red" disabled={busy}>
              {busy ? "확인 중..." : "로그인"}
            </button>
          </div>
        </form>

        <div className="lookup-other">
          <VrLink href="/tickets" className="lookup-other__btn">
            아직 티켓이 없으신가요
          </VrLink>
        </div>
      </div>
    </VirtualRunSubPage>
  );
}
