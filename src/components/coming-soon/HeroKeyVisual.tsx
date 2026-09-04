import Image from "next/image";
import { IMAGES } from "@/lib/assets";

/**
 * 디즈니 키비주얼 조합 이미지. 시안에서는 페이지 폭보다 조금 크게(116.48%),
 * 왼쪽으로 -6.48% 물려서 오른쪽이 화면 밖으로 빠져나가도록 놓여 있습니다.
 */
export function HeroKeyVisual() {
  return (
    <Image
      src={IMAGES.keyVisual.heroBand}
      alt="MARVEL RUN 키비주얼 - 사이클롭스, 씽, 닥터 둠, 토르, 캡틴 아메리카"
      width={2048}
      height={773}
      priority
      className="cs-hero"
    />
  );
}
