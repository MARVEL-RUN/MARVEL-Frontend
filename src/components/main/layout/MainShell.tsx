import { Header } from "./Header";
import { Footer } from "./Footer";
import { CinematicFX } from "../fx/CinematicFX";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <CinematicFX />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
