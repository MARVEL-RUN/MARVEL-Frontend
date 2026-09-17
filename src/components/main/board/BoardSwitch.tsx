"use client";

export const BOARD_TABS = [
  { id: "notices", label: "공지사항" },
  { id: "faq", label: "FAQ" },
] as const;

export type BoardTabId = (typeof BOARD_TABS)[number]["id"];

export function BoardSwitch({
  active,
  onSelect,
}: {
  active: BoardTabId;
  onSelect: (id: BoardTabId) => void;
}) {
  return (
    <div className="board-switch" role="tablist" aria-label="공지사항과 FAQ">
      {BOARD_TABS.map((tab) => {
        const on = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            className={on ? "board-switch__btn is-on" : "board-switch__btn"}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
