import { DiscountShell } from "@/components/main/discount/DiscountShell";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegisterRound2Standby } from "@/components/main/register/RegisterRound2Standby";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

function DiscountGateShell({ children }: { children: React.ReactNode }) {
  return (
    <DiscountShell>
      <section className="dl-stage dl-gate">
        <div className="wrap dl-gate__inner">
          <p className="dl-gate__tag">SPECIAL ACCESS</p>
          <div className="dl-gate__card">{children}</div>
        </div>
      </section>
    </DiscountShell>
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
