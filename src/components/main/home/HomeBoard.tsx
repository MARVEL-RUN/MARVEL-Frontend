"use client";

import { listFaqs } from "@/services/admin/faqs";
import {
  getPublicNoticeDetail,
  listPublicNotices,
  mergeNoticeList,
} from "@/services/main/notices";
import { useCallback, useEffect, useState } from "react";
import { BoardFold, type BoardFoldItem } from "../board/BoardFold";
import { BoardSwitch, type BoardTabId } from "../board/BoardSwitch";

async function withNoticeBodies(rows: BoardFoldItem[]) {
  return Promise.all(
    rows.map(async (row) => {
      try {
        const detail = await getPublicNoticeDetail(row.id);
        return { ...row, body: detail.content ?? "" };
      } catch {
        return { ...row, body: "" };
      }
    }),
  );
}

export function HomeBoard() {
  const [tab, setTab] = useState<BoardTabId>("notices");
  const [notices, setNotices] = useState<BoardFoldItem[]>([]);
  const [faqs, setFaqs] = useState<BoardFoldItem[]>([]);

  const loadNoticeBody = useCallback((id: string) => {
    void getPublicNoticeDetail(id)
      .then((detail) => {
        setNotices((rows) =>
          rows.map((row) =>
            row.id === id ? { ...row, body: detail.content ?? "" } : row,
          ),
        );
      })
      .catch(() => {
        setNotices((rows) =>
          rows.map((row) => (row.id === id ? { ...row, body: "" } : row)),
        );
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void listPublicNotices({
      page: 0,
      size: 5,
      limit: 5,
      sort: "LATEST",
    })
      .then(async (result) => {
        const rows = mergeNoticeList(
          result.pinnedNoticeList,
          result.noticePage.content ?? [],
        ).map((row) => ({
          id: row.id,
          title: row.title,
        }));
        if (cancelled) return;
        setNotices(rows);
        const filled = await withNoticeBodies(rows);
        if (!cancelled) setNotices(filled);
      })
      .catch(() => {
        if (!cancelled) setNotices([]);
      });

    void listFaqs().then((rows) => {
      if (cancelled) return;
      setFaqs(
        rows.map((row) => ({
          id: row.id,
          title: row.question,
          body: row.answer,
        })),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = tab === "notices" ? notices : faqs;
  const empty =
    tab === "notices" ? "등록된 공지가 없습니다." : "등록된 FAQ가 없습니다.";

  return (
    <section className="sec board-sec" id="bulletin">
      <div className="wrap reveal">
        <p className="kicker">04 / BULLETIN</p>
        <h2 className="sec__title">
          {tab === "notices" ? (
            <>
              공식 <em>공지</em>
            </>
          ) : (
            <>
              자주 묻는 <em>질문</em>
            </>
          )}
        </h2>
        <BoardSwitch active={tab} onSelect={setTab} />
        <BoardFold
          key={tab}
          items={items}
          empty={empty}
          mark={tab === "faq" ? "Q." : undefined}
          onExpand={tab === "notices" ? loadNoticeBody : undefined}
        />
      </div>
    </section>
  );
}
