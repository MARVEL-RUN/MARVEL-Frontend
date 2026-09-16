import { SideBanner } from "@/components/main/layout/SideBanner";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationGate
      fallback={
        <main className="page">
          <SideBanner kicker="PAY" title="결제" en="CHECKOUT" />
          <div className="page__body wrap">
            <RegisterClosed body="접수가 아직 열리지 않아 결제할 신청이 없습니다." />
          </div>
        </main>
      }
    >
      {children}
    </RegistrationGate>
  );
}
