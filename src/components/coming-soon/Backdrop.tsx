import { COMING_SOON_ASSETS } from "@/lib/assets";

export function Backdrop() {
  return (
    <div aria-hidden className="backdrop">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="backdrop__motif backdrop__motif--desk"
        src={COMING_SOON_ASSETS.motif}
        alt=""
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="backdrop__motif backdrop__motif--mobile"
        src={COMING_SOON_ASSETS.motifMobile}
        alt=""
      />
    </div>
  );
}
