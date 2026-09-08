"use client";

import { adminToken } from "@/lib/admin/token";
import { adminAuthService } from "@/services/admin/auth";
import { MAIN_ASSETS } from "@/lib/assets";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("admin-mode");
    document.body.classList.add("admin-mode");
    if (adminToken.getAccess()) router.replace("/admin");
    return () => {
      document.documentElement.classList.remove("admin-mode");
      document.body.classList.remove("admin-mode");
    };
  }, [router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account.trim() || !password.trim()) {
      setError("ID와 Password를 입력해 주세요.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await adminAuthService.login({ account: account.trim(), password });
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <Image
        src={MAIN_ASSETS.logo}
        alt="MARVEL RUN"
        width={1257}
        height={98}
        className="admin-login__mark"
        priority
      />
      <h1 className="admin-login__title">관리자 로그인</h1>
      <p className="admin-login__sub">Admin Login</p>
      <form className="admin-login__form" onSubmit={submit}>
        <div className="admin-login__field">
          <input
            name="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="ID"
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="admin-login__field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="button"
            className="admin-login__eye"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error ? <p className="admin-login__error">{error}</p> : null}
        <button className="admin-login__submit" type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="admin-login__hint">관리자 서비스를 이용하기 위해 로그인하세요</p>
    </div>
  );
}
