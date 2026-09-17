"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { listAdmins, resetAdminPassword } from "@/services/admin/admins";
import { useAdminAuthStore } from "@/stores";
import type { AdminUser } from "@/types/admin/admin";
import { useMutation, useQuery } from "@tanstack/react-query";

export function AdminsPage() {
  const user = useAdminAuthStore((s) => s.user);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "admins", user?.id],
    queryFn: () => listAdmins(user),
  });
  const { confirm, modal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();
  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetAdminPassword(id, password),
    onSuccess: () => adminToast.success("비밀번호가 초기화되었습니다."),
    onError: (error) =>
      adminToast.error(
        error instanceof Error ? error.message : "비밀번호 초기화에 실패했습니다.",
      ),
  });

  const handleResetPassword = async (row: AdminUser) => {
    const ok = await confirm({
      title: "비밀번호 초기화",
      message: `${row.account} 계정의 비밀번호를 초기화하시겠습니까?`,
    });
    if (!ok) return;
    const password = await prompt({
      title: "비밀번호 초기화",
      description: "새 비밀번호를 입력해주세요.",
      label: "비밀번호",
      placeholder: "비밀번호를 입력해주세요",
      type: "password",
      minLength: 4,
    });
    if (!password) return;
    resetPassword.mutate({ id: row.id, password });
  };

  return (
    <div className="admin-page">
      <AdminTableShell<AdminUser>
        title="관리자 관리"
        rows={data}
        loading={isLoading}
        empty="관리자 계정이 없습니다."
        rowKey={(row) => row.id}
        columns={[
          { key: "account", header: "계정", render: (row) => row.account },
          { key: "role", header: "권한", render: (row) => row.role },
          {
            key: "roles",
            header: "역할",
            render: (row) => (row.roles ?? [row.role]).join(", "),
          },
          {
            key: "manage",
            header: "관리",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                disabled={resetPassword.isPending}
                onClick={() => handleResetPassword(row)}
              >
                비밀번호 초기화
              </button>
            ),
          },
        ]}
      />
      {modal}
      {inputModal}
    </div>
  );
}
