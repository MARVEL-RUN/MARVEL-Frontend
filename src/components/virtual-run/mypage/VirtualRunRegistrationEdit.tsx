"use client";

import { useEffect, useState } from "react";
import { FormRow, FormSec } from "@/components/main/register/ApplyUi";
import { hasMainApi } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import { readLoginSession } from "@/lib/virtual-run/login-session";
import {
  fetchParticipantEntries,
  fetchPendingPackageUpgrade,
  participantProductLabel,
} from "@/services/main/participant-auth";
import { VirtualRunEntriesEdit } from "./VirtualRunEntriesEdit";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";

function birthLabel(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length !== 8) return (raw ?? "").trim();
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function phoneLabel(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return digits;
}

function editErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "신청 정보를 불러오지 못했습니다.";
  const message = err.message.trim();
  if (!message || message.length > 180) return "신청 정보를 불러오지 못했습니다.";
  if (err instanceof MainHttpError && err.status >= 500) return "신청 정보를 불러오지 못했습니다.";
  return message;
}

export function VirtualRunRegistrationEdit() {
  const [ticketName, setTicketName] = useState("");
  const [applicant, setApplicant] = useState({ name: "", birth: "", phone: "" });
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readLoginSession();
    if (!session || !hasMainApi) {
      setLoading(false);
      setError(session ? "API 주소가 설정되지 않았습니다." : "");
      return;
    }
    setApplicant({
      name: session.access.name.trim(),
      birth: birthLabel(session.access.birth),
      phone: phoneLabel(session.access.phNum),
    });
    let cancelled = false;
    Promise.all([
      fetchParticipantEntries(),
      fetchPendingPackageUpgrade().catch(() => null),
    ])
      .then(([entries, pendingOrder]) => {
        if (cancelled) return;
        setTicketName(participantProductLabel(entries) || session.categoryName);
        setPending(Boolean(pendingOrder));
      })
      .catch((err) => {
        if (!cancelled) setError(editErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="신청 정보 수정" en="EDIT">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          {loading ? (
            <p className="form__note">신청 정보를 불러오는 중...</p>
          ) : error && !applicant.name ? (
            <section className="block wait">
              <h2>신청 정보를 열 수 없습니다</h2>
              <p className="sec__body">{error}</p>
              <div className="flow__nav">
                <VrLink href="/mypage" className="btn btn--red">
                  마이페이지
                </VrLink>
              </div>
            </section>
          ) : pending ? (
            <section className="block wait">
              <h2>패키지 상향이 진행 중입니다</h2>
              <p className="sec__body">
                상향을 결제하거나 취소한 뒤에 신청 정보를 수정할 수 있습니다.
              </p>
              <div className="flow__nav">
                <VrLink href="/mypage/upgrade" className="btn btn--red">
                  상향 이어하기
                </VrLink>
              </div>
            </section>
          ) : (
            <>
              <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
                <FormSec
                  title="신청자"
                  note="신청자 정보는 신청할 때 입력한 정보입니다. 종목은 바꿀 수 없고, 참가자는 아래에서 수정합니다."
                >
                  <FormRow label="보유 티켓" locked>
                    <p className="form-row__hint">{ticketName || "종목 정보 없음"}</p>
                  </FormRow>
                  <FormRow label="이름" locked>
                    <p className="form-row__hint">{applicant.name}</p>
                  </FormRow>
                  <FormRow label="생년월일" locked>
                    <p className="form-row__hint">{applicant.birth}</p>
                  </FormRow>
                  <FormRow label="전화번호" locked>
                    <p className="form-row__hint">{applicant.phone}</p>
                  </FormRow>
                </FormSec>
                {error ? (
                  <p className="form__err" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="flow__nav vr-edit-back">
                  <VrLink href="/mypage" className="btn btn--ghost">
                    마이페이지
                  </VrLink>
                </div>
              </form>
              <VirtualRunEntriesEdit canModify applicant={applicant} />
            </>
          )}
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
