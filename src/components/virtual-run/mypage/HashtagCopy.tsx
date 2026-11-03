"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function HashtagCopy({ tags, showLabel = true }: { tags: readonly string[]; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(tags.join(" "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="vr-hashtag">
      {showLabel ? <p className="vr-hashtag__label">필수 해시태그</p> : null}
      <ul className="vr-hashtag__tags">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <button type="button" className="vr-hashtag__copy" onClick={copy} aria-live="polite">
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        {copied ? "복사했습니다" : "전체 복사"}
      </button>
    </div>
  );
}
