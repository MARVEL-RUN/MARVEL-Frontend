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
}: {
  heading: string;
  onPick: (kind: ApplyKind) => void;
  lookup?: boolean;
}) {
  return (
    <section className="block">
      <h2>{heading}</h2>
      <ul className="courses__grid courses__grid--stack">
        {KINDS.map((k) => (
          <li key={k.id}>
            <button
              type="button"
              className={`course course--${k.tone}`}
              onClick={() => onPick(k.id)}
            >
              <p className="course__code">{k.code}</p>
              <p className="course__dist">{lookup ? k.lookupTitle : k.title}</p>
              <p className="course__desc">{lookup ? k.lookupDesc : k.desc}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
