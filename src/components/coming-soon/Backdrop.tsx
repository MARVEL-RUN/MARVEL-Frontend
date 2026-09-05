export function Backdrop() {
  return (
    <div aria-hidden className="backdrop">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="backdrop__motif"
        src="/images/decor/info-motif.svg"
        alt=""
      />
    </div>
  );
}
