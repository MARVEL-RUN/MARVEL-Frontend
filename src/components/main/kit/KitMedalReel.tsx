import { MAIN_ASSETS } from "@/lib/assets";

export function KitMedalReel() {
  return (
    <div className="kit-medal-reel">
      <div className="kit-medal-reel__stage">
        <div className="kit-medal-reel__frame">
          <video
            className="kit-medal-reel__video"
            src={MAIN_ASSETS.kitMedalReel}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            aria-label="피니셔 메달 실물 영상"
          />
        </div>
      </div>
      <p className="kit-medal-reel__note">
        ※ 영상 속 토르 메달은 샘플 이미지이며, 최종 디자인은 상단 시안 이미지 기준으로
        제작됩니다.
      </p>
    </div>
  );
}
