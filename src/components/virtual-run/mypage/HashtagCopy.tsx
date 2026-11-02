"use client";

import { useState } from "react";

type Props = {
  text: string;
  className?: string;
};

export function HashtagCopy({ text, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={className ?? "vr-hashtag-copy"}>
      <p className="vr-hashtag-copy__text">{text}</p>
      <button type="button" className="btn btn--ghost vr-hashtag-copy__btn" onClick={copy}>
        {copied ? "복사됨" : "해시태그 복사"}
      </button>
    </div>
  );
}
