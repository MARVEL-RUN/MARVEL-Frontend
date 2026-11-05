"use client";

import { useState } from "react";
import { NoticeBody } from "@/components/main/notices/NoticeBody";
import {
  VIRTUAL_RUN_FAQS,
  VIRTUAL_RUN_FAQ_TABS,
  type VirtualRunFaqCategory,
} from "@/lib/virtual-run/guide";
import { VirtualRunSubPage } from "../../layout/VirtualRunSubPage";
import { VrLink } from "../../layout/VrLink";

export function VirtualRunFaqPage() {
  const [cat, setCat] = useState<"all" | VirtualRunFaqCategory>("all");
  const [openQ, setOpenQ] = useState<string | null>(VIRTUAL_RUN_FAQS[0]?.q ?? null);
  const shown = cat === "all" ? VIRTUAL_RUN_FAQS : VIRTUAL_RUN_FAQS.filter((f) => f.category === cat);

  function pick(next: typeof cat) {
    setCat(next);
    const first =
      next === "all" ? VIRTUAL_RUN_FAQS[0] : VIRTUAL_RUN_FAQS.find((f) => f.category === next);
    setOpenQ(first?.q ?? null);
  }

  return (
    <VirtualRunSubPage kicker="FAQ" title="자주 묻는 질문" en="HELP DESK">
      <div className="page__body wrap wrap--narrow">
        <div className="faq__tabs" role="tablist" aria-label="FAQ 분류">
          {VIRTUAL_RUN_FAQ_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={cat === tab.id}
              className={cat === tab.id ? "faq__tab is-on" : "faq__tab"}
              onClick={() => pick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="faq__count">총 {shown.length}건</p>
        {shown.length === 0 ? (
          <p className="board__empty">등록된 FAQ가 없습니다.</p>
        ) : (
          <ul className="faq">
            {shown.map((item) => {
              const open = openQ === item.q;
              return (
                <li key={item.q} className={open ? "is-open" : undefined}>
                  <button
                    type="button"
                    className="faq__btn"
                    aria-expanded={open}
                    onClick={() => setOpenQ(open ? null : item.q)}
                  >
                    <span className="faq__mark">Q.</span>
                    <strong className="faq__question">{item.q}</strong>
                    <span className="faq__chev" aria-hidden="true" />
                  </button>
                  {open ? (
                    <div className="faq__a">
                      <NoticeBody text={item.a} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <div className="lookup-other">
          <VrLink href="/notices" className="lookup-other__btn">
            공지사항 보기
          </VrLink>
        </div>
      </div>
    </VirtualRunSubPage>
  );
}
