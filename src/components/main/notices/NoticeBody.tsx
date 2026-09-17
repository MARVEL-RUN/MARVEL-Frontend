/* ==문구== 형광펜 / ■ 소제목 / 1. → ① */

import { type ReactNode } from "react";

const CIRCLE = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";

export function NoticeBody({ text }: { text: string }) {
  return (
    <div className="notice-body">
      {text.split("\n").map((line, i) => {
        if (line === "") return <div key={i} className="notice-gap" />;

        const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
        if (numbered) {
          return (
            <div key={i} className="notice-ol">
              <span className="notice-ol__no">{circleNo(Number(numbered[1]))}</span>
              <span className="notice-ol__text">{renderMarks(numbered[2], i)}</span>
            </div>
          );
        }

        const heading = /^■\s*(.+)$/.exec(line);
        if (heading) {
          return (
            <div key={i} className="notice-line">
              ■{" "}
              <mark className="notice-hl notice-hl--head">{heading[1]}</mark>
            </div>
          );
        }

        return (
          <div key={i} className="notice-line">
            {renderMarks(line, i)}
          </div>
        );
      })}
    </div>
  );
}

function circleNo(n: number) {
  if (n >= 1 && n <= CIRCLE.length) return CIRCLE[n - 1];
  return `${n}.`;
}

function renderMarks(text: string, lineKey: number) {
  const nodes: ReactNode[] = [];
  const re = /==(.+?)==/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <mark key={`${lineKey}-${i}`} className="notice-hl">
        {match[1]}
      </mark>,
    );
    i += 1;
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
