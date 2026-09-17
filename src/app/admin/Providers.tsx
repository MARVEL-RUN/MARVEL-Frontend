"use client";

import { AuthInitializer } from "@/components/admin/AuthInitializer";
import { QueryProvider } from "@/components/admin/QueryProvider";
import { AdminToastHost } from "@/components/admin/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthInitializer />
      {children}
      <AdminToastHost />
    </QueryProvider>
  );
}
