import Image from "next/image";

export function HeroCharacters() {
  return (
    <div className="hero">
      <Image
        src="/images/hero-characters.png"
        alt="사이클롭스, 씽, 닥터 둠, 토르, 캡틴 아메리카"
        width={3791}
        height={2083}
        priority
        sizes="(max-width: 960px) 100vw, 960px"
      />
    </div>
  );
}
