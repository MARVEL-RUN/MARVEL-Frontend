import { SideBanner } from "@/components/main/layout/SideBanner";
import { RegisterClosed } from "@/components/main/register/RegisterClosed";
import { RegistrationGate } from "@/components/main/register/RegistrationGate";

export default function LookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationGate
      fallback={
        <main className="page">
          <SideBanner kicker="INTEL" title="신청조회" en="FIND YOUR ENTRY" />
          <div className="page__body wrap wrap--narrow">
            <RegisterClosed body="접수는 아직 열리지 않았습니다. 오픈 이후 이 페이지에서 신청 내역을 조회할 수 있습니다." />
          </div>
        </main>
      }
    >
      {children}
    </RegistrationGate>
  );
}
