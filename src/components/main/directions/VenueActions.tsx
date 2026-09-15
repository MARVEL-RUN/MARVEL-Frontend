"use client";

import { useState } from "react";
import { EVENT } from "@/lib/event";

export function VenueActions() {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(EVENT.venueAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="venue-actions">
      <button type="button" className="btn btn--ghost" onClick={copyAddress}>
        {copied ? "복사됨" : "주소 복사"}
      </button>
      <a
        className="btn btn--red"
        href={EVENT.mapUrl}
        target="_blank"
        rel="noreferrer"
      >
        카카오맵에서 보기
      </a>
    </div>
  );
}
