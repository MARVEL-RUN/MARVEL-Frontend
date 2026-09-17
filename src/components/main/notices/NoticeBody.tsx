/* ==문구== 형광펜 / ■ 소제목 */

import { Fragment, type ReactNode } from "react";

export function NoticeBody({ text }: { text: string }) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? "\n" : null}
      {renderLine(line, i)}
    </Fragment>
  ));
}

function renderLine(line: string, lineKey: number) {
  const heading = /^■\s*(.+)$/.exec(line);
  if (heading) {
    return (
      <>
        ■{" "}
        <mark className="notice-hl notice-hl--head">{heading[1]}</mark>
      </>
    );
  }
  return renderMarks(line, lineKey);
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
