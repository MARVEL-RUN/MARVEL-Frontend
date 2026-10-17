import { SideBanner } from "@/components/main/layout/SideBanner";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegisterRound2Standby } from "@/components/main/register/RegisterRound2Standby";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

export default function DiscountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationGate
      fallback={
        <main className="page page--discount-entry">
          <SideBanner kicker="DISCOUNT" title="할인 링크 접수" en="SPECIAL ENTRY" />
          <div className="page__body wrap">
            <RegisterClosed />
          </div>
        </main>
      }
      round2Fallback={
        <main className="page page--discount-entry">
          <SideBanner kicker="DISCOUNT" title="할인 링크 접수" en="SPECIAL ENTRY" />
          <div className="page__body wrap">
            <RegisterRound2Standby />
          </div>
        </main>
      }
    >
      {children}
    </RegistrationGate>
  );
}
