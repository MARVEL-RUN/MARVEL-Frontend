"use client";

import { listFaqs } from "@/services/admin/faqs";
import { listAdminNotices } from "@/services/admin/notices";
import { useEffect, useState } from "react";
import { BoardFold } from "../board/BoardFold";
import { BoardSwitch, type BoardTabId } from "../board/BoardSwitch";
import { orderNotices } from "../notices/order";

export function HomeBoard() {
  const [tab, setTab] = useState<BoardTabId>("notices");
  const [notices, setNotices] = useState<{ id: string; title: string; body: string }[]>(
    [],
  );
  const [faqs, setFaqs] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    void listAdminNotices().then((rows) => {
      setNotices(
        orderNotices(rows).map((row) => ({
          id: row.id,
          title: row.title,
          body: row.body,
        })),
      );
    });
    void listFaqs().then((rows) => {
      setFaqs(
        rows.map((row) => ({
          id: row.id,
          title: row.question,
          body: row.answer,
        })),
      );
    });
  }, []);

  const items = tab === "notices" ? notices : faqs;
  const empty =
    tab === "notices" ? "등록된 공지가 없습니다." : "등록된 FAQ가 없습니다.";

  return (
    <section className="sec board-sec" id="bulletin">
      <div className="wrap wrap--narrow reveal">
        <h2 className="board-sec__title">
          {tab === "notices" ? "공지사항" : "FAQ"}
        </h2>
        <BoardSwitch active={tab} onSelect={setTab} />
        <BoardFold key={tab} items={items} empty={empty} />
      </div>
    </section>
  );
}
