import {
  VIRTUAL_RUN_BOARD_HREF,
  VIRTUAL_RUN_BOARD_SECTIONS,
} from "./community";
import type { VirtualRunOpenFlags } from "./open-schedule";

export type VirtualRunNavChild = {
  href: string;
  label: string;
  openFlag?: keyof VirtualRunOpenFlags;
  spotsOnly?: boolean;
};

export type VirtualRunNavItem =
  | {
      href: string;
      label: string;
      openFlag?: keyof VirtualRunOpenFlags;
      pickChild?: never;
      children?: never;
    }
  | {
      href: string;
      label: string;
      openFlag?: keyof VirtualRunOpenFlags;
      pickChild: true;
      children: readonly VirtualRunNavChild[];
    };

export function isVirtualRunNavGroup(
  item: VirtualRunNavItem,
): item is Extract<VirtualRunNavItem, { pickChild: true }> {
  return "pickChild" in item && item.pickChild === true;
}

/** 글로벌 헤더 L1 · 드롭다운 (로고 별도) */
export const VIRTUAL_RUN_NAV_ITEMS: VirtualRunNavItem[] = [
  { href: "/", label: "마블 버추얼런", openFlag: "publicInfo" },
  {
    href: "/event",
    label: "행사 안내",
    pickChild: true,
    openFlag: "publicInfo",
    children: [
      { href: "/event", label: "행사 개요" },
      { href: "/event#schedule", label: "운영 일정" },
    ],
  },
  { href: "/kit", label: "기념품", openFlag: "publicInfo" },
  {
    href: "/guide",
    label: "인증 가이드",
    pickChild: true,
    openFlag: "guide",
    children: [
      { href: "/guide", label: "가이드 홈" },
      { href: "/guide/running", label: "러닝 인증" },
      { href: "/guide/kit", label: "키트 인증" },
    ],
  },
  {
    href: VIRTUAL_RUN_BOARD_HREF,
    label: "커뮤니티",
    pickChild: true,
    openFlag: "publicInfo",
    children: [...VIRTUAL_RUN_BOARD_SECTIONS],
  },
  {
    href: "/mypage",
    label: "마이페이지",
    pickChild: true,
    openFlag: "mypageLogin",
    children: [
      { href: "/mypage", label: "마이페이지" },
      { href: "/mypage/sessions", label: "회차 인증", openFlag: "certSubmit" },
      { href: "/mypage/kit", label: "키트 카드" },
      { href: "/mypage/rewards", label: "리워드 내역" },
      { href: "/mypage/spots", label: "거점 이벤트", spotsOnly: true },
    ],
  },
];
