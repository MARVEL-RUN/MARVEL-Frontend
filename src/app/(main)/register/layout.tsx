import { SideBanner } from "@/components/main/layout/SideBanner";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationGate
      fallback={
        <main className="page">
          <SideBanner kicker="ENTRY" title="참가신청" en="JOIN THE RUN" />
          <div className="page__body wrap">
            <RegisterClosed />
          </div>
        </main>
      }
    >
      {children}
    </RegistrationGate>
  );
}
