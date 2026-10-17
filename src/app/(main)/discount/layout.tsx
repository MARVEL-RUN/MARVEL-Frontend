import { DiscountEntryHero } from "@/components/main/discount/DiscountEntryHero";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegisterRound2Standby } from "@/components/main/register/RegisterRound2Standby";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

const GATE_HERO = {
  kicker: "DISCOUNT",
  title: "할인 링크 접수",
  en: "SPECIAL ENTRY",
  variant: "standard" as const,
};

function DiscountGateShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="page page--discount-entry page--discount-entry--standard">
      <DiscountEntryHero entry={GATE_HERO} />
      <div className="discount-entry__sheet">
        <div className="wrap">{children}</div>
      </div>
    </main>
  );
}

export default function DiscountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationGate
      fallback={
        <DiscountGateShell>
          <RegisterClosed />
        </DiscountGateShell>
      }
      round2Fallback={
        <DiscountGateShell>
          <RegisterRound2Standby />
        </DiscountGateShell>
      }
    >
      {children}
    </RegistrationGate>
  );
}
