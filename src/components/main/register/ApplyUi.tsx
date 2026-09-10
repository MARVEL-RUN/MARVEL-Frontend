import { useState, type ReactNode } from "react";
import { EVENT } from "@/lib/event";
import {
  EMAIL_CUSTOM,
  EMAIL_DOMAINS,
  GENDERS,
  SHIRT_SIZES,
  courseAllowsChild,
  courseById,
  formatPhone,
  joinEmail,
  splitEmail,
  ticketFee,
  ticketLabel,
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
  ticket,
  onChange,
}: {
  value: CourseId | "";
  ticket: TicketKind;
  onChange: (courseId: CourseId, ticket: TicketKind) => void;
}) {
  const selected = value ? courseById(value) : undefined;
  const tickets: TicketKind[] = selected
    ? courseAllowsChild(selected)
      ? ["adult", "child"]
      : ["adult"]
    : [];

  return (
    <div className="course-pick">
      <div className="course-pick__col">
        <p className="course-pick__head">거리</p>
        <div className="course-pick__list">
          {EVENT.courses.map((c) => (
            <button
              key={c.id}
              type="button"
              className={value === c.id ? "is-on" : undefined}
              onClick={() =>
                onChange(c.id, courseAllowsChild(c) ? ticket : "adult")
              }
            >
              {c.distance}
            </button>
          ))}
        </div>
      </div>
      <div className="course-pick__col">
        <p className="course-pick__head">세부종목</p>
        <div className="course-pick__list">
          {tickets.length ? (
            tickets.map((t) => (
              <button
                key={t}
                type="button"
                className={ticket === t ? "is-on" : undefined}
                onClick={() => value && onChange(value, t)}
              >
                {ticketLabel(t)}
              </button>
            ))
          ) : (
            <p className="course-pick__empty">거리를 선택해주세요</p>
          )}
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
