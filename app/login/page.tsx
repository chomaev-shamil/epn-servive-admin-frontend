"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, loginOtp } from "@/lib/api";
import { setTokens } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestOtp(email);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginOtp(email, code, navigator.userAgent);
      setTokens(res.accessToken, res.refreshToken);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo-mark">E</div>
          <h1 className="login-card__title">EPN Admin</h1>
          <p className="login-card__subtitle">
            {step === "email"
              ? "Sign in to your admin account"
              : "Enter the verification code"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="login-card__form">
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Get Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-card__form">
            <p className="login-card__hint" style={{ marginTop: 0, marginBottom: "0.25rem" }}>
              Code sent to <strong style={{ color: "var(--text)" }}>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textAlign: "center" }}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Sign In"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              style={{ alignSelf: "center" }}
            >
              Use different email
            </button>
          </form>
        )}

        {error && <div className="alert-danger" style={{ marginTop: "0.75rem" }}>{error}</div>}
      </div>
    </div>
  );
}
