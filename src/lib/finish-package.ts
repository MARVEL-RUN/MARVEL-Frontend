import { MAIN_ASSETS } from "@/lib/assets";

export type FinishPackageItem = {
  no: number;
  title: string;
  image?: string;
  note?: string;
};

export const FINISH_PACKAGE_ITEMS: FinishPackageItem[] = [
  {
    no: 1,
    title: "완주 메달",
    image: MAIN_ASSETS.kitFinishMedals,
  },
  { no: 2, title: "메달 케이스", image: MAIN_ASSETS.kitFinishMedalCase },
  { no: 3, title: "마블런 스티커", image: MAIN_ASSETS.kitFinishStickers },
  { no: 4, title: "KFC 쿠폰", image: MAIN_ASSETS.kitFinishKfcCoupon },
  {
    no: 6,
    title: "슬리플러스 딥 슬립 + 슬리프레소",
    image: MAIN_ASSETS.kitFinishSleeplusSleepresso,
  },
  {
    no: 7,
    title: "안드로스 비넛츠 땅콩버터스틱",
    image: MAIN_ASSETS.kitFinishAndrosBeNuts,
  },
  {
    no: 8,
    title: "롯데칠성 해피즈",
    image: MAIN_ASSETS.kitFinishHappiz,
    note: "※ 3종 중 1종 랜덤 증정",
  },
  { no: 9, title: "빙그레 왕실말차", image: MAIN_ASSETS.kitFinishBinggraeMatcha },
  { no: 10, title: "샘표 맛병아리콩", image: MAIN_ASSETS.kitFinishSempioChickpeas },
  { no: 11, title: "아워홈 지리산수", image: MAIN_ASSETS.kitFinishJirisanWater },
];

export const FINISH_PACKAGE_PICKUP_NOTE =
  "※ 완주 패키지는 완주 후 현장에서 수령 가능합니다.";
