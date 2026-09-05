import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
