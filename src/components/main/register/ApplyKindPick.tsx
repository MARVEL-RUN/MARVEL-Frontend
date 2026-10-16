import { ChevronRight } from "lucide-react";
import type { ApplyKind } from "@/lib/register";

const KINDS: {
  id: ApplyKind;
  code: string;
  title: string;
  desc: string;
  lookupTitle: string;
  lookupDesc: string;
  tone: "cyan" | "red";
}[] = [
  {
    id: "individual",
    code: "SOLO",
    title: "개인신청",
    desc: "혼자 코스를 고르고 참가합니다.",
    lookupTitle: "개인 조회",
    lookupDesc: "개인으로 접수한 내역을 확인합니다.",
    tone: "cyan",
  },
  {
    id: "group",
    code: "SQUAD",
    title: "단체신청",
    desc: "대표자가 여러 명을 한꺼번에 신청합니다.",
    lookupTitle: "단체 조회",
    lookupDesc: "단체로 접수한 내역을 확인합니다.",
    tone: "red",
  },
];

export function ApplyKindPick({
  heading,
  onPick,
  lookup = false,
  disabled = false,
}: {
  heading: string;
  onPick: (kind: ApplyKind) => void;
  lookup?: boolean;
  disabled?: boolean;
}) {
  return (
    <section className="block">
      <h2>{heading}</h2>
      <ul className="kind-pick">
        {KINDS.map((k, index) => (
          <li key={k.id}>
            <button
              type="button"
              className={`kind-pick__item kind-pick__item--${k.tone}`}
              disabled={disabled}
              onClick={() => onPick(k.id)}
            >
              <span className="kind-pick__no">{String(index + 1).padStart(2, "0")}</span>
              <span className="kind-pick__body">
                <span className="kind-pick__code">{k.code}</span>
                <strong className="kind-pick__title">{lookup ? k.lookupTitle : k.title}</strong>
                <span className="kind-pick__desc">{lookup ? k.lookupDesc : k.desc}</span>
              </span>
              <ChevronRight className="kind-pick__go" size={22} strokeWidth={2.25} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
