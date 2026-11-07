"use client";

import { FormEvent, useState } from "react";
import {
  AddressField,
  BirthText,
  FormRow,
  FormSec,
  GenderPick,
  PasswordField,
  PhoneField,
} from "@/components/main/register/ApplyUi";
import { formatAddressForApi } from "@/lib/daumPostcode";
import { MainHttpError } from "@/lib/main/fetch";
import { genderToApi, phoneDigits } from "@/lib/payment/map";
import { applicationPasswordError, filterNoSpaceName, type Gender } from "@/lib/register";
import { uiGenderFromApi } from "@/lib/registration-gender";
import {
  changeParticipantPassword,
  modifyParticipantAddress,
  modifyParticipantOrderer,
} from "@/services/main/participant-auth";
import type { ParticipantOrder } from "@/services/main/participant-orders";

function errorMessage(err: unknown, fallback: string) {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.trim();
  if (!message || message.length > 180) return fallback;
  if (err instanceof MainHttpError && err.status >= 500) return fallback;
  return message;
}

function splitApiAddress(raw: string) {
  const text = raw.trim();
  const hit = text.match(/^\[(\d{5})\]\s*(.*)$/);
  if (hit) return { zonecode: hit[1], address: hit[2] };
  return { zonecode: "", address: text };
}

function toLookupBirth(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function VirtualRunOrderForms({
  order,
  orderCount,
  onOrdererSaved,
}: {
  order: ParticipantOrder;
  orderCount: number;
  onOrdererSaved: (next: { name: string; birth: string; phone: string }) => void;
}) {
  const parsed = splitApiAddress(order.address);
  const [zonecode, setZonecode] = useState(parsed.zonecode);
  const [address, setAddress] = useState(parsed.address);
  const [addressDetail, setAddressDetail] = useState(order.addressDetail);
  const [name, setName] = useState(order.name);
  const [birth, setBirth] = useState(order.birth.replace(/\D/g, ""));
  const [phone, setPhone] = useState(order.phNum);
  const [gender, setGender] = useState<Gender | "">(uiGenderFromApi(order.gender) ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addressError, setAddressError] = useState("");
  const [ordererError, setOrdererError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [addressBusy, setAddressBusy] = useState(false);
  const [ordererBusy, setOrdererBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [ordererSaved, setOrdererSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const canEditAddress = !order.canceled && order.modifyAllowed;
  const canEditOrderer = !order.canceled || orderCount > 1;

  async function onAddress(e: FormEvent) {
    e.preventDefault();
    if (addressBusy) return;
    if (!address.trim()) {
      setAddressError("배송 주소를 입력하세요.");
      return;
    }
    if (address.length > 300 || addressDetail.trim().length > 255) {
      setAddressError("주소는 300자, 상세 주소는 255자까지 입력할 수 있습니다.");
      return;
    }
    setAddressBusy(true);
    setAddressError("");
    setAddressSaved(false);
    try {
      await modifyParticipantAddress({
        address: formatAddressForApi(zonecode, address),
        addressDetail: addressDetail.trim(),
      });
      setAddressSaved(true);
    } catch (err) {
      setAddressError(errorMessage(err, "배송지를 수정하지 못했습니다."));
    } finally {
      setAddressBusy(false);
    }
  }

  async function onOrderer(e: FormEvent) {
    e.preventDefault();
    if (ordererBusy) return;
    const nextName = filterNoSpaceName(name);
    if (!nextName) {
      setOrdererError("이름을 입력하세요.");
      return;
    }
    if (birth.replace(/\D/g, "").length !== 8) {
      setOrdererError("생년월일을 입력하세요.");
      return;
    }
    if (phoneDigits(phone).length < 10) {
      setOrdererError("전화번호를 입력하세요.");
      return;
    }
    if (gender !== "male" && gender !== "female") {
      setOrdererError("성별을 선택하세요.");
      return;
    }
    setOrdererBusy(true);
    setOrdererError("");
    setOrdererSaved(false);
    try {
      const body = {
        name: nextName,
        phNum: phoneDigits(phone),
        birth: toLookupBirth(birth),
        gender: genderToApi(gender),
      };
      await modifyParticipantOrderer(body);
      onOrdererSaved({ name: body.name, birth: body.birth, phone: body.phNum });
      setOrdererSaved(true);
    } catch (err) {
      setOrdererError(errorMessage(err, "주문자 정보를 수정하지 못했습니다."));
    } finally {
      setOrdererBusy(false);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    if (passwordBusy) return;
    if (!currentPassword.trim()) {
      setPasswordError("현재 비밀번호를 입력하세요.");
      return;
    }
    const invalid = applicationPasswordError(newPassword);
    if (invalid) {
      setPasswordError(invalid);
      return;
    }
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordSaved(false);
    try {
      await changeParticipantPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(errorMessage(err, "비밀번호를 바꾸지 못했습니다."));
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <>
      {canEditAddress ? (
        <form className="form" onSubmit={(e) => void onAddress(e)} noValidate>
          <FormSec title="배송지" note="이 주문의 배송지만 바뀝니다.">
            <FormRow label="주소" required>
              <AddressField
                zonecode={zonecode}
                address={address}
                addressDetail={addressDetail}
                onChange={(next) => {
                  if (next.zonecode != null) setZonecode(next.zonecode);
                  if (next.address != null) setAddress(next.address);
                  if (next.addressDetail != null) setAddressDetail(next.addressDetail);
                }}
                required
              />
            </FormRow>
          </FormSec>
          {addressError ? (
            <p className="form__err" role="alert">
              {addressError}
            </p>
          ) : null}
          {addressSaved ? <p className="form__note">배송지를 수정했습니다.</p> : null}
          <div className="flow__nav">
            <button type="submit" className="btn btn--red" disabled={addressBusy}>
              {addressBusy ? "저장 중..." : "배송지 저장"}
            </button>
          </div>
        </form>
      ) : null}

      {canEditOrderer ? (
        <form className="form" onSubmit={(e) => void onOrderer(e)} noValidate>
          <FormSec
            title="주문자"
            note="이름·연락처·생년월일·성별은 이 계정의 모든 주문에 함께 바뀝니다. 다음 로그인부터 새 정보로 들어옵니다."
          >
            <FormRow label="이름" required>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </FormRow>
            <FormRow label="생년월일" required>
              <BirthText name="ordererBirth" value={birth} onChange={setBirth} />
            </FormRow>
            <FormRow label="전화번호" required>
              <PhoneField name="ordererPhone" value={phone} onChange={setPhone} autoComplete="tel" />
            </FormRow>
            <FormRow label="성별" required>
              <GenderPick name="ordererGender" value={gender} onChange={setGender} />
            </FormRow>
          </FormSec>
          {ordererError ? (
            <p className="form__err" role="alert">
              {ordererError}
            </p>
          ) : null}
          {ordererSaved ? <p className="form__note">주문자 정보를 수정했습니다.</p> : null}
          <div className="flow__nav">
            <button type="submit" className="btn btn--red" disabled={ordererBusy}>
              {ordererBusy ? "저장 중..." : "주문자 저장"}
            </button>
          </div>
        </form>
      ) : null}

      <form className="form" onSubmit={(e) => void onPassword(e)} noValidate>
        <FormSec
          title="비밀번호"
          note="모든 주문에 함께 바뀝니다. 지금 로그인은 유지되고, 만료된 뒤에는 새 비밀번호로 다시 로그인합니다."
        >
          <FormRow label="현재 비밀번호" required>
            <PasswordField
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </FormRow>
          <FormRow label="새 비밀번호" required>
            <PasswordField
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
          </FormRow>
        </FormSec>
        {passwordError ? (
          <p className="form__err" role="alert">
            {passwordError}
          </p>
        ) : null}
        {passwordSaved ? <p className="form__note">비밀번호를 바꿨습니다.</p> : null}
        <div className="flow__nav">
          <button type="submit" className="btn btn--red" disabled={passwordBusy}>
            {passwordBusy ? "저장 중..." : "비밀번호 변경"}
          </button>
        </div>
      </form>
    </>
  );
}
