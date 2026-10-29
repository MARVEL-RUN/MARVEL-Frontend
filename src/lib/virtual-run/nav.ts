export const VIRTUAL_RUN_NAV = [
  { href: "/", label: "메인" },
  { href: "/event", label: "행사 안내" },
  { href: "/tickets", label: "티켓 구매" },
  { href: "/guide", label: "인증 가이드" },
  { href: "/mypage", label: "마이페이지" },
] as const;

export const VIRTUAL_RUN_MYPAGE_NAV = [
  { href: "/mypage/kit", label: "키트 카드", desc: "배송 상태 · 키트 인증" },
  { href: "/mypage/sessions", label: "회차 카드", desc: "러닝 인증 · 완주증" },
  { href: "/mypage/rewards", label: "리워드 내역", desc: "발송 내역 · 재요청" },
  {
    href: "/mypage/spots",
    label: "거점 이벤트",
    desc: "협업 확정 시 노출",
    spotsOnly: true,
  },
] as const;
