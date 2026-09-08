"use client";

import { QueryProvider } from "@/components/admin/QueryProvider";
import { AuthInitializer } from "@/components/admin/AuthInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthInitializer />
      {children}
    </QueryProvider>
  );
}
