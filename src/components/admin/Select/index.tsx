"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type AdminSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type Props<T extends string = string> = {
  value: T;
  options: AdminSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  width?: number | string;
};

export function AdminSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  width,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={["admin-select", open ? "is-open" : "", className].filter(Boolean).join(" ")}
      style={width != null ? { width } : undefined}
    >
      <button
        type="button"
        className="admin-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="admin-select__value">{selected?.label}</span>
        <ChevronDown size={14} className="admin-select__chevron" aria-hidden />
      </button>
      {open ? (
        <ul id={listId} className="admin-select__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`admin-select__option${active ? " is-active" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="admin-select__mark" aria-hidden />
                  <span>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
