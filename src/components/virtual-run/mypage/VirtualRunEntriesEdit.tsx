"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { mainToast } from "@/components/main/feedback/MainFeedback";
import { BirthPick, FormRow, FormSec, GenderPick, PhoneField } from "@/components/main/register/ApplyUi";
import { MainHttpError } from "@/lib/main/fetch";
import { filterNoSpaceName, type Gender } from "@/lib/register";
import { VR_ASSEMBLE_PACKAGE, vrPackageById, type VrPackage } from "@/lib/virtual-run/packages";
import { virtualRunRoundById, type VirtualRunRoundId } from "@/lib/virtual-run/rounds";
import {
  fetchParticipantEntries,
  patchParticipantEntries,
  type ParticipantEntry,
  type ParticipantEntryUpdate,
} from "@/services/main/participant-auth";
import { useVrPath } from "../layout/VrLink";

type Applicant = {
  name: string;
  birth: string;
  phone: string;
};

type Row = {
  entryId: string;
  itemSortOrder: number;
  productId: string;
  productName: string;
  eventCategoryId: string;
  categoryName: string;
  name: string;
  birth: string;
  phone: string;
  gender: Gender | "";
  sameAs: boolean;
};

function birthDigits(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 8);
}

function toApiBirth(raw: string) {
  const digits = birthDigits(raw);
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toUiGender(raw: string): Gender | "" {
  if (raw === "F" || raw === "FEMALE") return "female";
  if (raw === "M" || raw === "MALE") return "male";
  return "";
}

function toRow(entry: ParticipantEntry, applicant: Applicant): Row {
  const row: Row = {
    entryId: entry.entryId,
    itemSortOrder: entry.itemSortOrder,
    productId: entry.productId,
    productName: entry.productName,
    eventCategoryId: entry.eventCategoryId,
    categoryName: entry.categoryName,
    name: entry.name,
    birth: birthDigits(entry.birth),
    phone: entry.phNum,
    gender: toUiGender(entry.gender),
    sameAs: false,
  };
  row.sameAs = samePerson(row, applicant);
  return row;
}

function samePerson(row: Pick<Row, "name" | "birth" | "phone">, applicant: Applicant) {
  if (!applicant.name.trim()) return false;
  return (
    filterNoSpaceName(row.name) === filterNoSpaceName(applicant.name) &&
    birthDigits(row.birth) === birthDigits(applicant.birth) &&
    row.phone.replace(/\D/g, "") === applicant.phone.replace(/\D/g, "")
  );
}

function sameRow(a: Row, b: Row) {
  return (
    filterNoSpaceName(a.name) === filterNoSpaceName(b.name) &&
    birthDigits(a.birth) === birthDigits(b.birth) &&
    a.phone.replace(/\D/g, "") === b.phone.replace(/\D/g, "") &&
    a.gender === b.gender
  );
}

function roundOf(row: Row): VirtualRunRoundId | null {
  const text = `${row.productId} ${row.productName} ${row.eventCategoryId} ${row.categoryName}`.toLowerCase();
  if (text.includes("avenger") || text.includes("어벤")) return "avengers";
  if (text.includes("xmen") || text.includes("x-men") || text.includes("엑스")) return "x-men";
  if (text.includes("fantastic") || text.includes("판타")) return "fantastic-four";
  return null;
}

function packageFor(rows: Row[]): VrPackage {
  const packaged = rows.some((row) => {
    const text = `${row.productId} ${row.productName}`.toLowerCase();
    return text.includes("package") || text.includes("패키지") || text.includes("어셈블");
  });
  if (packaged) return VR_ASSEMBLE_PACKAGE;
  const round = roundOf(rows[0]);
  return round ? vrPackageById(round) : VR_ASSEMBLE_PACKAGE;
}

function themeLabel(row: Row) {
  const round = roundOf(row);
  return round ? virtualRunRoundById(round).theme : row.categoryName || "참가자";
}

function birthLabel(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) return "";
  return `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6, 8)}`;
}

function genderLabel(gender: Gender | "") {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "";
}

function phoneLabel(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return digits;
}

function rowError(row: Row) {
  const label = row.categoryName || row.productName || "참가자";
  const name = filterNoSpaceName(row.name);
  if (!name) return `${label} 이름을 입력하세요.`;
  if (name.length > 50) return `${label} 이름은 50자까지 입력할 수 있습니다.`;
  if (birthDigits(row.birth).length !== 8) return `${label} 생년월일을 입력하세요.`;
  const phone = row.phone.replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 14) return `${label} 전화번호를 입력하세요.`;
  if (row.gender !== "male" && row.gender !== "female") return `${label} 성별을 선택하세요.`;
  return "";
}

function editErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "참가자 정보를 수정하지 못했습니다.";
  const message = err.message.trim();
  if (!message || message.length > 180) return "참가자 정보를 수정하지 못했습니다.";
  if (err instanceof MainHttpError && err.status >= 500) return "참가자 정보를 수정하지 못했습니다.";
  return message;
}

export function VirtualRunEntriesEdit({
  canModify,
  applicant,
}: {
  canModify: boolean;
  applicant: Applicant;
}) {
  const router = useRouter();
  const toHref = useVrPath();
  const [saved, setSaved] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const applicantRef = useRef(applicant);
  applicantRef.current = applicant;

  useEffect(() => {
    let cancelled = false;
    fetchParticipantEntries()
      .then((entries) => {
        if (cancelled) return;
        const next = entries.map((entry) => toRow(entry, applicantRef.current));
        setSaved(next);
        setRows(next);
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

  function patch(entryId: string, next: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.entryId === entryId ? { ...row, ...next } : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canModify || busy) return;
    const changed = rows.filter((row) => {
      const base = saved.find((item) => item.entryId === row.entryId);
      return base ? !sameRow(row, base) : true;
    });
    if (!changed.length) {
      setError("바꿀 참가자 정보가 없습니다.");
      return;
    }
    const invalid = changed.map(rowError).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    const body: ParticipantEntryUpdate[] = changed.map((row) => ({
      entryId: row.entryId,
      name: filterNoSpaceName(row.name),
      phNum: row.phone.replace(/\D/g, ""),
      birth: toApiBirth(row.birth),
      gender: row.gender === "female" ? "F" : "M",
    }));
    setBusy(true);
    setError("");
    try {
      const updated = await patchParticipantEntries(body);
      const next = rows.map((row) => {
        const match = updated.find((item) => item.entryId === row.entryId);
        if (!match) return row;
        return {
          ...row,
          name: match.name,
          birth: birthDigits(match.birth),
          phone: match.phNum,
          gender: toUiGender(match.gender),
          sameAs: samePerson(
            { name: match.name, birth: birthDigits(match.birth), phone: match.phNum },
            applicantRef.current,
          ),
        };
      });
      setSaved(next);
      setRows(next);
      mainToast.success("참가자 정보를 수정했습니다.");
      router.push(toHref("/mypage"));
    } catch (err) {
      setError(editErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function copyApplicant(row: Row, sameAs: boolean): Row {
    if (!sameAs) return { ...row, sameAs: false };
    return {
      ...row,
      sameAs: true,
      name: filterNoSpaceName(applicant.name),
      birth: birthDigits(applicant.birth),
      phone: applicant.phone.replace(/\D/g, ""),
    };
  }

  const lines = rows.reduce<{ order: number; rows: Row[] }[]>((groups, row) => {
    const found = groups.find((group) => group.order === row.itemSortOrder);
    if (found) found.rows.push(row);
    else groups.push({ order: row.itemSortOrder, rows: [row] });
    return groups;
  }, []);
  const allSame = rows.length > 1 && rows.every((row) => row.sameAs);

  if (loading) return <p className="form__note">참가자 정보를 불러오는 중...</p>;
  if (!rows.length && !error) return null;

  return (
    <form className="form vr-edit-runners" onSubmit={(e) => void onSubmit(e)} noValidate>
      <FormSec
        kicker="02 / RUNNER"
        title="패키지별 참가자"
        note="신청자와 같으면 체크합니다. 어셈블 패키지는 테마마다 참가자를 입력합니다. 배번호는 정보 수정 기간 이후에 부여됩니다."
      >
        {rows.length > 1 ? (
          <div className="vr-recipients__all">
            <label className={`vr-recipients__same${allSame ? " is-on" : ""}`}>
              <input
                type="checkbox"
                checked={allSame}
                disabled={!canModify || busy}
                onChange={(e) => {
                  const sameAs = e.target.checked;
                  setRows((prev) => prev.map((row) => copyApplicant(row, sameAs)));
                }}
              />
              모두 신청자와 동일
            </label>
          </div>
        ) : null}
        <ul className="vr-pkg-lines">
          {lines.map((line, index) => {
            const pkg = packageFor(line.rows);
            return (
              <li key={line.order || index} className={`is-${pkg.accent}`}>
                <img src={pkg.image} alt="" width={72} height={72} />
                <div className="vr-pkg-lines__body">
                  <div className="vr-pkg-lines__head">
                    <strong>
                      {index + 1}. {pkg.name}
                    </strong>
                  </div>
                  <div className={line.rows.length > 1 ? "vr-pkg-lines__themes" : undefined}>
                    {line.rows.map((row) => {
                      const round = roundOf(row);
                      return (
                        <div
                          key={row.entryId}
                          className={round ? `vr-pkg-lines__theme is-${virtualRunRoundById(round).accent}` : "vr-pkg-lines__theme"}
                        >
                          {line.rows.length > 1 ? <strong>{themeLabel(row)}</strong> : null}
                          <label className={`vr-recipients__same${row.sameAs ? " is-on" : ""}`}>
                            <input
                              type="checkbox"
                              checked={row.sameAs}
                              disabled={!canModify || busy}
                              onChange={(e) => {
                                const next = copyApplicant(row, e.target.checked);
                                patch(row.entryId, next);
                              }}
                            />
                            신청자와 동일
                          </label>
                          {row.sameAs ? (
                            <p className="vr-pkg-lines__same">
                              {row.name || "신청자"}
                              {" · "}
                              {birthLabel(row.birth) || "생년월일"}
                              {" · "}
                              {genderLabel(row.gender) || "성별"}
                              {" · "}
                              {phoneLabel(row.phone) || "휴대폰"}
                            </p>
                          ) : (
                            <>
                              <FormRow label="이름" required>
                                <input
                                  type="text"
                                  value={row.name}
                                  maxLength={50}
                                  disabled={!canModify || busy}
                                  placeholder="참가 이름"
                                  onChange={(e) =>
                                    patch(row.entryId, {
                                      name: filterNoSpaceName(e.target.value),
                                      sameAs: false,
                                    })
                                  }
                                />
                              </FormRow>
                              <FormRow label="생년월일" required>
                                <BirthPick
                                  value={row.birth}
                                  disabled={!canModify || busy}
                                  onChange={(birth) => patch(row.entryId, { birth, sameAs: false })}
                                />
                              </FormRow>
                              <FormRow label="휴대폰 번호" required>
                                <PhoneField
                                  value={row.phone}
                                  disabled={!canModify || busy}
                                  placeholder="010-0000-0000"
                                  onChange={(phone) => patch(row.entryId, { phone, sameAs: false })}
                                />
                              </FormRow>
                              <FormRow label="성별" required>
                                <GenderPick
                                  name={`entry-gender-${row.entryId}`}
                                  value={row.gender}
                                  disabled={!canModify || busy}
                                  onChange={(gender) => patch(row.entryId, { gender, sameAs: false })}
                                />
                              </FormRow>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </FormSec>
      {error ? (
        <p className="form__err" role="alert">
          {error}
        </p>
      ) : null}
      {rows.length ? (
        <div className="flow__nav">
          <button type="submit" className="btn btn--red" disabled={!canModify || busy}>
            {busy ? "저장 중..." : "참가자 저장"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
