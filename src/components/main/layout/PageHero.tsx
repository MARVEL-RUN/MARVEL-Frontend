export function PageHero({
  kicker,
  title,
  en,
}: {
  kicker: string;
  title: string;
  en: string;
}) {
  return (
    <header className="page-hero">
      <div className="page-hero__inner">
        <p className="kicker">{kicker}</p>
        <h1 className="page-hero__title">{title}</h1>
        <p className="page-hero__en">{en}</p>
      </div>
    </header>
  );
}
