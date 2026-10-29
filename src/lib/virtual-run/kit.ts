export type VirtualRunKitThemeId = "avengers" | "x-men" | "fantastic-four";

export type VirtualRunKitItemKind =
  | "package-full"
  | "medal-front"
  | "medal-back"
  | "medal-case"
  | "bib"
  | "keycap-keyring"
  | "sticker"
  | "bandana"
  | "sticker-pack"
  | "socks"
  | "package"
  | "finish-line"
  | "carton-box";

export type VirtualRunKitItem = {
  kind: VirtualRunKitItemKind;
  label: string;
  file: string;
  layout: "ribbon" | "square" | "landscape" | "wide";
};

export type VirtualRunKitTheme = {
  id: VirtualRunKitThemeId;
  label: string;
  lead: string;
  items: VirtualRunKitItem[];
};

const kitFile = (theme: VirtualRunKitThemeId, file: string) =>
  `/images/virtual-run/kit/${theme}/${file}` as const;

export function virtualRunKitImage(theme: VirtualRunKitThemeId, file: string) {
  return kitFile(theme, file);
}

export const VIRTUAL_RUN_KIT_THEMES: VirtualRunKitTheme[] = [
  {
    id: "avengers",
    label: "어벤저스",
    lead: "AVENGERS: DOOMSDAY 테마 키트",
    items: [
      { kind: "package-full", label: "전체 패키지", file: "package-full.png", layout: "wide" },
      { kind: "medal-front", label: "피니셔 메달 · 앞", file: "medal-front.png", layout: "ribbon" },
      { kind: "medal-back", label: "피니셔 메달 · 뒤", file: "medal-back.png", layout: "ribbon" },
      { kind: "medal-case", label: "메달 케이스", file: "medal-case.png", layout: "square" },
      { kind: "bib", label: "배번호", file: "bib.png", layout: "landscape" },
      { kind: "keycap-keyring", label: "4구 키캡 키링", file: "keycap-keyring-4.png", layout: "ribbon" },
      { kind: "sticker", label: "스티커 팩", file: "sticker.png", layout: "square" },
      { kind: "finish-line", label: "피니시 라인", file: "finish-line.png", layout: "wide" },
      { kind: "carton-box", label: "카툰박스", file: "carton-box.png", layout: "square" },
    ],
  },
  {
    id: "x-men",
    label: "엑스맨",
    lead: "X-MEN 테마 키트",
    items: [
      { kind: "package-full", label: "전체 패키지", file: "package-full.png", layout: "wide" },
      { kind: "medal-front", label: "피니셔 메달 · 앞", file: "medal-front.png", layout: "ribbon" },
      { kind: "medal-back", label: "피니셔 메달 · 뒤", file: "medal-back.png", layout: "ribbon" },
      { kind: "medal-case", label: "메달 케이스", file: "medal-case.png", layout: "square" },
      { kind: "bib", label: "배번호", file: "bib.png", layout: "landscape" },
      { kind: "bandana", label: "반다나", file: "bandana.png", layout: "square" },
      { kind: "sticker-pack", label: "스티커 팩", file: "sticker-pack.png", layout: "square" },
      { kind: "finish-line", label: "피니시 라인", file: "finish-line.png", layout: "wide" },
      { kind: "carton-box", label: "카톤박스", file: "carton-box.png", layout: "square" },
    ],
  },
  {
    id: "fantastic-four",
    label: "판타스틱4",
    lead: "FANTASTIC FOUR 테마 키트",
    items: [
      { kind: "package-full", label: "전체 패키지", file: "package-full.png", layout: "wide" },
      { kind: "package", label: "패키지", file: "package.png", layout: "square" },
      { kind: "medal-front", label: "피니셔 메달 · 앞", file: "medal-front.png", layout: "ribbon" },
      { kind: "medal-back", label: "피니셔 메달 · 뒤", file: "medal-back.png", layout: "ribbon" },
      {
        kind: "medal-case",
        label: "메달 케이스 · 단상자",
        file: "medal-case-pedestal.png",
        layout: "square",
      },
      { kind: "bib", label: "배번호", file: "bib.png", layout: "landscape" },
      { kind: "socks", label: "양말", file: "socks.png", layout: "square" },
      { kind: "finish-line", label: "피니시 라인", file: "finish-line.png", layout: "wide" },
      { kind: "carton-box", label: "카툰박스", file: "carton-box.png", layout: "square" },
    ],
  },
];
