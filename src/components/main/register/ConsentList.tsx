"use client";

import { useState } from "react";
import {
  REGISTER_CONSENTS,
  type ConsentId,
} from "@/lib/legal";
import { LegalBlocks } from "../legal/LegalBlocks";

export type ConsentValues = Record<ConsentId, boolean>;

export function ConsentList({
  values,
  onChange,
}: {
  values: ConsentValues;
  onChange: (id: ConsentId, next: boolean) => void;
}) {
  const [open, setOpen] = useState<ConsentId | null>(null);

  return (
    <div className="consents">
      {REGISTER_CONSENTS.map((item) => {
        const expanded = open === item.id;
        return (
          <article key={item.id} className={expanded ? "consent is-open" : "consent"}>
            <button
              type="button"
              className="consent__head"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : item.id)}
            >
              <span>{item.title}</span>
              <em aria-hidden>{expanded ? "−" : "+"}</em>
            </button>
            {expanded ? (
              <div className="consent__body">
                {item.lead ? <p className="sec__body">{item.lead}</p> : null}
                <LegalBlocks nodes={item.nodes} />
              </div>
            ) : null}
            <label className="check">
              <input
                type="checkbox"
                checked={values[item.id]}
                onChange={(e) => onChange(item.id, e.target.checked)}
              />
              <span>{item.checkbox}</span>
            </label>
          </article>
        );
      })}
    </div>
  );
}
