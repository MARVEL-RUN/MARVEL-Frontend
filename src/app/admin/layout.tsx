import type { Metadata } from "next";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: {
    default: "관리자 | MARVEL RUN 2026 KOREA",
    template: "%s",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <Providers>{children}</Providers>
    </AdminLayout>
  );
}
