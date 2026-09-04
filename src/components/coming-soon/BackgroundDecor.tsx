export function BackgroundDecor() {
  return (
    <div className="decor" aria-hidden>
      <div className="decor__halftone" />
      <div className="decor__streaks" />
      <svg className="decor__chevrons" viewBox="0 0 220 480" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="chevron" width="46" height="62" patternUnits="userSpaceOnUse">
            <path
              d="M4 3 L34 31 L4 59"
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="9"
            />
          </pattern>
        </defs>
        <rect width="220" height="480" fill="url(#chevron)" />
      </svg>
      <p className="decor__run">RUN</p>
    </div>
  );
}
