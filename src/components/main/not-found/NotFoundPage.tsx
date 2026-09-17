import Link from "next/link";
import { CinematicFX } from "../fx/CinematicFX";
import { Footer } from "../layout/Footer";
import { Header } from "../layout/Header";
import { KeyboardInset } from "../layout/KeyboardInset";
import { LegalModalProvider } from "../legal/LegalModal";

export function NotFoundPage({ chrome }: { chrome: boolean }) {
  const body = (
    <main className={chrome ? "page page--lost" : "page page--bare"}>
      <div className="page__body wrap wrap--narrow">
        <section className="block wait">
          <p className="kicker">OFF COURSE</p>
          <h2>이 주소에는 페이지가 없습니다</h2>
          <p className="sec__body">
            {chrome
              ? "주소를 다시 확인하거나 홈과 대회안내에서 원하는 페이지로 이동해 주세요."
              : "주소를 다시 확인하거나 홈으로 이동해 주세요."}
          </p>
          <div className="flow__nav">
            <Link href="/" className="btn btn--red">
              홈으로
            </Link>
            {chrome ? (
              <Link href="/guide" className="btn btn--ghost">
                대회안내
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );

  if (!chrome) {
    return <div className="site">{body}</div>;
  }

  return (
    <LegalModalProvider>
      <div className="site site--lost">
        <CinematicFX />
        <KeyboardInset />
        <Header />
        {body}
        <Footer />
      </div>
    </LegalModalProvider>
  );
}
