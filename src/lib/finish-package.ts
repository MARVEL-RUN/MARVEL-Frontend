const FINISH_PACKAGE_BASE = "/images/main/kit/finish-package";

export type FinishPackageItem = {
  no: number;
  title: string;
  image?: string;
  wide?: boolean;
  note?: string;
};

export const FINISH_PACKAGE_ITEMS: FinishPackageItem[] = [
  {
    no: 1,
    title: "완주 메달",
    image: `${FINISH_PACKAGE_BASE}/medals.png`,
    wide: true,
  },
  { no: 2, title: "메달 케이스", image: `${FINISH_PACKAGE_BASE}/medal-case.png` },
  { no: 3, title: "마블런 스티커", image: `${FINISH_PACKAGE_BASE}/stickers.png` },
  { no: 4, title: "KFC 쿠폰", image: `${FINISH_PACKAGE_BASE}/kfc-coupon.png` },
  {
    no: 5,
    title: "크라운스포츠 뉴트리션 검바",
    note: "※ 3종 중 2종 랜덤 증정",
  },
  {
    no: 6,
    title: "슬리플러스 딥 슬립 + 슬리프레소",
    image: `${FINISH_PACKAGE_BASE}/sleeplus-sleepresso.png`,
  },
  {
    no: 7,
    title: "안드로스 비넛츠 땅콩버터스틱",
    image: `${FINISH_PACKAGE_BASE}/andros-be-nuts.png`,
  },
  {
    no: 8,
    title: "롯데칠성 해피즈",
    image: `${FINISH_PACKAGE_BASE}/happiz.png`,
    note: "※ 3종 중 1종 랜덤 증정",
  },
  { no: 9, title: "빙그레 왕실말차", image: `${FINISH_PACKAGE_BASE}/binggrae-matcha.png` },
  { no: 10, title: "샘표 맛병아리콩", image: `${FINISH_PACKAGE_BASE}/sempio-chickpeas.png` },
  { no: 11, title: "아워홈 지리산수", image: `${FINISH_PACKAGE_BASE}/jirisan-water.png` },
];

export const FINISH_PACKAGE_PICKUP_NOTE =
  "※ 완주 패키지는 완주 후 현장에서 수령 가능합니다.";
