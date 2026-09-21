import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { EVENT } from "@/lib/event";
import { formatDaumBaseAddress, openDaumPostcode } from "@/lib/daumPostcode";
import {
  EMAIL_CUSTOM,
  EMAIL_DOMAINS,
  GENDERS,
  ADULT_SHIRT_SIZES,
  courseAllowsChild,
  courseById,
  courseClosedReason,
  courseHasTimingChip,
  courseNote,
  courseOpenForBirth,
  feeDigits,
  formatPhone,
  joinEmail,
  splitEmail,
  ticketFee,
  ticketForBirth,
  type CourseId,
  type Gender,
  type TicketKind,
} from "@/lib/register";

const YEARS = Array.from({ length: 90 }, (_, i) => String(2026 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export function ApplyNotice({ lines }: { lines: string[] }) {
  return (
    <div className="apply-notice">
      {lines.map((line) => (
        <p key={line} className={line.startsWith("[") ? "is-warn" : undefined}>
          {line}
        </p>
      ))}
    </div>
  );
}

export function FormSec({
  title,
  kicker,
  note,
  children,
}: {
  title: string;
  kicker?: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="form-sec">
      <header className="form-sec__head">
        {kicker ? <p className="form-sec__index">{kicker}</p> : null}
        <h2>{title}</h2>
      </header>
      {note ? <p className="form-sec__note">{note}</p> : null}
      <div className="form-sec__body">{children}</div>
    </section>
  );
}

export function ApplyHint({ children }: { children: ReactNode }) {
  return <div className="apply-hint">{children}</div>;
}

export function FormRow({
  label,
  required,
  locked,
  children,
}: {
  label: string;
  required?: boolean;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={locked ? "form-row is-locked" : "form-row"}>
      <p className="form-row__label">
        {label}
        {required ? <em> *</em> : null}
      </p>
      <div className="form-row__ctrl">{children}</div>
    </div>
  );
}

export function BirthPick({
  value,
  onChange,
  disabled,
  yearHint,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  yearHint?: string;
}) {
  const y = value.slice(0, 4);
  const m = value.slice(4, 6);
  const d = value.slice(6, 8);

  function setPart(part: "y" | "m" | "d", next: string) {
    const yy = part === "y" ? next : y;
    const mm = part === "m" ? next : m;
    const dd = part === "d" ? next : d;
    onChange(`${yy}${mm}${dd}`);
  }

  return (
    <div className={`birth-pick${disabled ? " is-disabled" : ""}`}>
      <select
        value={y}
        onChange={(e) => setPart("y", e.target.value)}
        aria-label="년도"
        disabled={disabled}
      >
        <option value="">년도</option>
        {YEARS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>.</span>
      <select
        value={m}
        onChange={(e) => setPart("m", e.target.value)}
        aria-label="월"
        disabled={disabled}
      >
        <option value="">월</option>
        {MONTHS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>.</span>
      <select
        value={d}
        onChange={(e) => setPart("d", e.target.value)}
        aria-label="일"
        disabled={disabled}
      >
        <option value="">일</option>
        {DAYS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {yearHint ? (
        <p className="birth-pick__year-hint form-row__hint is-err" role="alert">
          {yearHint}
        </p>
      ) : null}
    </div>
  );
}

export function GenderPick({
  name,
  value,
  onChange,
  disabled,
}: {
  name: string;
  value: Gender | "";
  onChange: (next: Gender) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`radio-row${disabled ? " is-disabled" : ""}`}>
      {GENDERS.map((g) => (
        <label key={g.id}>
          <input
            type="radio"
            name={name}
            checked={value === g.id}
            onChange={() => onChange(g.id)}
            disabled={disabled}
          />
          {g.label}
        </label>
      ))}
    </div>
  );
}

export function ShirtPick({
  value,
  onChange,
  sizes = ADULT_SHIRT_SIZES,
  enabled,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  sizes?: readonly string[];
  enabled?: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="seg">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          className={value === size ? "is-on" : undefined}
          disabled={disabled || (enabled ? !enabled.includes(size) : false)}
          onClick={() => onChange(size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
}

export function KitFixed({ courseId }: { courseId: CourseId | "" }) {
  const course = courseId ? courseById(courseId) : undefined;
  if (!course) {
    return <p className="kit-fixed kit-fixed--empty">—</p>;
  }

  const items = [
    { id: "medal", label: `${course.distance} 메달`, on: true },
    { id: "scarf", label: "응원스카프", on: true },
    {
      id: "bib",
      label: courseHasTimingChip(course.id)
        ? "배번호(기록칩 포함)"
        : "배번호(기록칩 미포함)",
      on: true,
    },
    { id: "shirt", label: "티셔츠", on: true },
  ];

  return (
    <ul className="kit-fixed">
      {items.map((item) => (
        <li key={item.id} className={item.on ? undefined : "is-off"}>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function CoursePick({
  value,
  birth,
  onChange,
}: {
  value: CourseId | "";
  birth: string;
  onChange: (courseId: CourseId, ticket: TicketKind) => void;
}) {
  const selected = value ? courseById(value) : undefined;
  const ticket =
    selected && !courseAllowsChild(selected)
      ? "adult"
      : ticketForBirth(birth);

  return (
    <div className="course-pick">
      <div className="course-pick__box">
        <div className="course-pick__col">
          <p className="course-pick__head">거리</p>
          <div className="course-pick__list">
            {EVENT.courses.map((c) => {
              const open = courseOpenForBirth(c, birth);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={value === c.id ? "is-on" : undefined}
                  disabled={!open}
                  title={open ? undefined : courseClosedReason(birth)}
                  onClick={() => {
                    if (!open) return;
                    onChange(
                      c.id,
                      courseAllowsChild(c) ? ticketForBirth(birth) : "adult",
                    );
                  }}
                >
                  {c.distance}
                </button>
              );
            })}
          </div>
        </div>
        <div className="course-pick__col">
          <p className="course-pick__head">세부종목</p>
          <div className="course-pick__list">
            {selected ? (
              <button
                type="button"
                className={`is-on course-pick__code--${selected.tone}`}
              >
                {selected.code}
              </button>
            ) : (
              <p className="course-pick__empty">거리를 선택해주세요</p>
            )}
          </div>
        </div>
      </div>
      <CourseFeeTable value={value} ticket={ticket} />
    </div>
  );
}

function CourseFeeHead({
  long,
  short,
}: {
  long: string;
  short: string;
}) {
  return (
    <span className="course-pick__fees-h" aria-label={long}>
      <span className="course-pick__fees-label course-pick__fees-label--long" aria-hidden="true">
        {long}
      </span>
      <span className="course-pick__fees-label course-pick__fees-label--short" aria-hidden="true">
        {short}
      </span>
    </span>
  );
}

export function CourseFeeTable({
  value,
  ticket,
}: {
  value?: CourseId | "";
  ticket?: TicketKind;
}) {
  return (
    <div className="course-pick__fees">
      <div className="course-pick__fees-table">
        <div className="course-pick__fees-head">
          <span>종목</span>
          <CourseFeeHead long="세부종목" short="세부" />
          <CourseFeeHead long="일반 참가비" short="참가비" />
          <CourseFeeHead long="만 12세 이하 참가비" short="만 12세 이하" />
        </div>
        <div className="course-pick__fees-body">
          {EVENT.courses.map((c) => {
            const on = value === c.id;
            const childOn = on && ticket === "child" && courseAllowsChild(c);
            const adultOn = on && !childOn;
            return (
              <div key={c.id} className="course-pick__fees-row">
                <span className={on ? "is-on" : undefined}>{c.distance}</span>
                <span
                  className={`course-pick__code--${c.tone}${on ? " is-on" : ""}`}
                >
                  {c.code}
                </span>
                <span
                  className={
                    adultOn
                      ? "is-on"
                      : childOn
                        ? "is-on is-dim"
                        : undefined
                  }
                >
                  {feeDigits(c.fee)}
                </span>
                <span
                  className={
                    childOn
                      ? "is-on is-fee-child"
                      : on
                        ? "is-dim"
                        : undefined
                  }
                >
                  {courseNote(c)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FeeText({
  courseId,
  ticket,
}: {
  courseId: CourseId | "";
  ticket: TicketKind;
}) {
  const course = courseId ? courseById(courseId) : undefined;
  if (!course) return null;
  return <p className="fee-text">{ticketFee(course, ticket)}</p>;
}

export function birthView(value: string) {
  if (!/^\d{8}$/.test(value)) return value || "—";
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

export function BirthText({
  value,
  onChange,
  name,
  required,
  autoComplete,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  let shown = digits;
  if (digits.length > 4) shown = `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.length > 6) {
    shown = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  return (
    <input
      type="text"
      name={name}
      inputMode="numeric"
      placeholder="YYYY-MM-DD"
      autoComplete={autoComplete}
      value={shown}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
      required={required}
      disabled={disabled}
      readOnly={disabled}
      aria-label="생년월일"
    />
  );
}

export function PhoneField({
  value,
  onChange,
  name,
  placeholder,
  required,
  autoComplete,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      name={name}
      placeholder={placeholder}
      value={formatPhone(value)}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      readOnly={disabled}
      maxLength={13}
    />
  );
}

const GUARDIAN_CONSENT_LABEL =
  "법정대리인(보호자)으로서 참가 신청에 동의합니다.";

export const GROUP_GUARDIAN_CONSENT_LABEL =
  "단체장으로서 만 14세 미만 참가자의 참가 신청에 동의합니다.";

export function GuardianConsentField({
  agreed,
  onChange,
  label = GUARDIAN_CONSENT_LABEL,
  variant = "check",
}: {
  agreed: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  variant?: "check" | "button";
}) {
  if (variant === "button") {
    return (
      <button
        type="button"
        className={agreed ? "guardian-consent is-agreed" : "guardian-consent"}
        aria-pressed={agreed}
        onClick={() => onChange(!agreed)}
      >
        <span className="guardian-consent__label">{label}</span>
        <span className="guardian-consent__state">
          {agreed ? "동의함" : "탭하여 동의"}
        </span>
      </button>
    );
  }

  return (
    <label
      className={
        agreed ? "guardian-consent-check is-agreed" : "guardian-consent-check"
      }
    >
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="guardian-consent-check__label">{label}</span>
    </label>
  );
}

const EMAIL_SET = new Set<string>(EMAIL_DOMAINS);

export function EmailField({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
}) {
  const { local, domain } = splitEmail(value);
  const [pick, setPick] = useState(() =>
    EMAIL_SET.has(domain) ? domain : domain ? EMAIL_CUSTOM : "",
  );
  const custom = pick === EMAIL_CUSTOM;

  function setLocal(next: string) {
    onChange(joinEmail(next.replace(/\s/g, ""), domain));
  }

  function setDomain(next: string) {
    onChange(joinEmail(local, next.replace(/\s/g, "").replace(/^@+/, "")));
  }

  function onPick(next: string) {
    setPick(next);
    if (next === EMAIL_CUSTOM) {
      onChange(joinEmail(local, EMAIL_SET.has(domain) ? "" : domain));
      return;
    }
    onChange(joinEmail(local, next));
  }

  return (
    <div className={custom ? "email-pick is-custom" : "email-pick"}>
      <input
        type="text"
        className="email-pick__local"
        inputMode="email"
        autoComplete="email"
        placeholder="이메일"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        required={required}
        aria-label="이메일"
      />
      <span aria-hidden>@</span>
      {custom ? (
        <input
          type="text"
          className="email-pick__host"
          inputMode="url"
          placeholder="직접입력"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required={required}
          aria-label="이메일 도메인"
        />
      ) : null}
      <select
        className="email-pick__pick"
        value={pick}
        onChange={(e) => onPick(e.target.value)}
        required={required && !custom}
        aria-label="이메일 도메인 선택"
      >
        <option value="">선택</option>
        {EMAIL_DOMAINS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
        <option value={EMAIL_CUSTOM}>직접입력</option>
      </select>
    </div>
  );
}

export function PasswordField({
  value,
  onChange,
  required,
  disabled,
  name = "password",
  label = "신청 비밀번호",
  placeholder = "신청조회용 비밀번호 (6자 이상)",
  minLength = 6,
  autoComplete = "new-password",
  hideManager = false,
}: {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  label?: string;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
  hideManager?: boolean;
}) {
  const [show, setShow] = useState(false);
  const ignore = hideManager || autoComplete === "off";

  return (
    <div className={`password-pick${disabled ? " is-disabled" : ""}`}>
      <input
        type={ignore ? "text" : show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={ignore ? "off" : autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        minLength={minLength}
        required={required}
        disabled={disabled}
        aria-label={label}
        className={ignore && !show ? "is-mask" : undefined}
        data-lpignore={ignore ? "true" : undefined}
        data-1p-ignore={ignore ? "true" : undefined}
        data-bwignore={ignore ? "true" : undefined}
        data-form-type={ignore ? "other" : undefined}
      />
      <button
        type="button"
        className="password-pick__eye"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        disabled={disabled}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function AddressField({
  zonecode,
  address,
  addressDetail,
  onChange,
  required,
}: {
  zonecode: string;
  address: string;
  addressDetail: string;
  onChange: (next: {
    zonecode?: string;
    address?: string;
    addressDetail?: string;
  }) => void;
  required?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setBusy(true);
    setError("");
    try {
      await openDaumPostcode((data) => {
        onChange({
          zonecode: data.zonecode,
          address: formatDaumBaseAddress(data),
        });
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "주소 검색을 열지 못했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="address-pick">
      <div className="address-pick__row">
        <input
          type="text"
          name="zonecode"
          className="address-pick__zip"
          placeholder="우편번호"
          value={zonecode ?? ""}
          readOnly
          required={required}
          onClick={search}
          aria-label="우편번호"
        />
        <button
          type="button"
          className="address-pick__btn"
          onClick={search}
          disabled={busy}
        >
          {busy ? "여는 중..." : "우편번호 찾기"}
        </button>
      </div>
      <input
        type="text"
        name="address"
        className="address-pick__base"
        placeholder="기본주소"
        value={address ?? ""}
        readOnly
        required={required}
        onClick={search}
        aria-label="기본주소"
      />
      <input
        type="text"
        name="addressDetail"
        className="address-pick__detail"
        placeholder="동·호수·건물명 등"
        value={addressDetail ?? ""}
        onChange={(e) => onChange({ addressDetail: e.target.value })}
        autoComplete="address-line2"
        required={required}
        aria-label="상세주소"
      />
      {error ? <p className="form__err">{error}</p> : null}
    </div>
  );
}
