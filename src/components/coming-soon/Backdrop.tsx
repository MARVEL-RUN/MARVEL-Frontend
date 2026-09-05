import { COMING_SOON_ASSETS } from "@/lib/assets";

export function Backdrop() {
  return (
    <div aria-hidden className="backdrop">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="backdrop__motif"
        src={COMING_SOON_ASSETS.motif}
        alt=""
      />
    </div>
  );
}
