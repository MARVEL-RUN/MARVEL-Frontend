import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { EVENT } from "@/lib/event";
import { formatDaumBaseAddress, openDaumPostcode } from "@/lib/daumPostcode";
import {
  EMAIL_CUSTOM,
  EMAIL_DOMAINS,
  GENDERS,
  SHIRT_SIZES,
  courseAllowsChild,
  courseById,
  courseClosedReason,
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
  type ShirtSize,
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
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="form-sec">
      <h2 className="form-sec__head">{title}</h2>
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
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="form-row">
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
}: {
  value: string;
  onChange: (next: string) => void;
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
    <div className="birth-pick">
      <select value={y} onChange={(e) => setPart("y", e.target.value)} aria-label="년도">
        <option value="">년도</option>
        {YEARS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>.</span>
      <select value={m} onChange={(e) => setPart("m", e.target.value)} aria-label="월">
        <option value="">월</option>
        {MONTHS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>.</span>
      <select value={d} onChange={(e) => setPart("d", e.target.value)} aria-label="일">
        <option value="">일</option>
        {DAYS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

export function GenderPick({
  name,
  value,
  onChange,
}: {
  name: string;
  value: Gender | "";
  onChange: (next: Gender) => void;
}) {
  return (
    <div className="radio-row">
      {GENDERS.map((g) => (
        <label key={g.id}>
          <input
            type="radio"
            name={name}
            checked={value === g.id}
            onChange={() => onChange(g.id)}
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
}: {
  value: ShirtSize | "";
  onChange: (next: ShirtSize) => void;
}) {
  return (
    <div className="seg">
      {SHIRT_SIZES.map((size) => (
        <button
          key={size}
          type="button"
          className={value === size ? "is-on" : undefined}
          onClick={() => onChange(size)}
        >
          {size}
        </button>
      ))}
    </div>
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
      <div className="course-pick__fees">
        <div className="course-pick__fees-head">
          <span>종목</span>
          <span>세부종목</span>
          <span>단가</span>
          <span>비고</span>
        </div>
        <div className="course-pick__fees-body">
          {EVENT.courses.map((c) => (
            <div
              key={c.id}
              className={value === c.id ? "course-pick__fees-row is-on" : "course-pick__fees-row"}
            >
              <span>{c.distance}</span>
              <span className={`course-pick__code--${c.tone}`}>{c.code}</span>
              <span>{feeDigits(c.fee)}</span>
              <span>{courseNote(c)}</span>
            </div>
          ))}
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
}: {
  value: string;
  onChange: (next: string) => void;
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
      inputMode="numeric"
      placeholder="YYYY-MM-DD"
      value={shown}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
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
}: {
  value: string;
  onChange: (next: string) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
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
      maxLength={13}
    />
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
    <div className="email-pick">
      <input
        type="text"
        className="email-pick__local"
        inputMode="email"
        autoComplete="username"
        placeholder="아이디"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        required={required}
        aria-label="이메일 아이디"
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
  name = "password",
  placeholder = "신청조회용 비밀번호 (4자 이상)",
  minLength = 4,
}: {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  name?: string;
  placeholder?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-pick">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        minLength={minLength}
        required={required}
        aria-label="신청 비밀번호"
      />
      <button
        type="button"
        className="password-pick__eye"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
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
