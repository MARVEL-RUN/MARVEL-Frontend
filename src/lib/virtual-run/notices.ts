/** API 공지가 없을 때 홈 게시판 폴백 */
export type VirtualRunHomeNotice = {
  id: string;
  title: string;
  body: string;
};

export const VIRTUAL_RUN_HOME_NOTICES: VirtualRunHomeNotice[] = [
  {
    id: "vr-home-notice-launch",
    title: "2026 마블 버추얼런 개최 안내",
    body: [
      "<어벤져스: 둠스데이> 개봉을 기념해 마블 버추얼런을 개최합니다.",
      "정해진 코스 없이 전국 어디서나 5km를 완주하고, 테마별 한정판 메달·키트·리워드에 참여할 수 있습니다.",
      "자세한 일정과 티켓 정보는 행사 안내·티켓 구매 메뉴에서 확인해 주세요.",
    ].join("\n\n"),
  },
  {
    id: "vr-home-notice-ticket",
    title: "티켓 오픈 및 패키지 안내",
    body: [
      "싱글 패키지(40,000원)는 어벤져스·엑스맨·판타스틱4 중 한 테마를 선택합니다.",
      "어셈블 패키지(80,000원)는 세 테마 키트를 한 번에 구매하는 상품입니다.",
      "티켓은 공식 홈페이지에서 순차 오픈되며, 구매 후 마이페이지에서 신청 정보를 확인할 수 있습니다.",
    ].join("\n\n"),
  },
  {
    id: "vr-home-notice-cert",
    title: "러닝·키트 인증 일정 안내",
    body: [
      "키트 배송 시작 후 마이페이지에서 회차별 5km 러닝 인증과 키트 인증을 제출할 수 있습니다.",
      "인증 방법·필수 해시태그·제출 서류는 인증 가이드에서 미리 확인해 주세요.",
      "일정은 행사 운영 상황에 따라 변경될 수 있으며, 변경 시 공지사항으로 안내합니다.",
    ].join("\n\n"),
  },
];
