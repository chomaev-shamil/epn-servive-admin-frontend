"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, loginOtp, verifyTotp } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [step, setStep] = useState<"email" | "code" | "totp">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpFormRef = useRef<HTMLFormElement>(null);
  const totpFormRef = useRef<HTMLFormElement>(null);

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

      if (res.totpRequired && res.totpToken) {
        setTotpToken(res.totpToken);
        setStep("totp");
        return;
      }

      if (res.accessToken && res.refreshToken) {
        setTokens(res.accessToken, res.refreshToken);
        router.replace("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyTotp(totpToken, totpCode);
      setTokens(res.accessToken, res.refreshToken);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4) {
      setTimeout(() => otpFormRef.current?.requestSubmit(), 0);
    }
  }, []);

  const handleTotpChange = useCallback((value: string) => {
    const cleaned = value.replace(/\s/g, "").slice(0, 8);
    setTotpCode(cleaned);
    if (cleaned.length === 6 || cleaned.length === 8) {
      setTimeout(() => totpFormRef.current?.requestSubmit(), 0);
    }
  }, []);

  const stepConfig = {
    email: {
      title: "Добро пожаловать",
      description: "Войдите в панель администратора EPN",
    },
    code: {
      title: "Проверьте почту",
      description: `Мы отправили код на ${email}`,
    },
    totp: {
      title: "Двухфакторная аутентификация",
      description: "Введите код из приложения-аутентификатора",
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-sm">
            {step === "totp" ? <ShieldCheck className="size-6" /> : "E"}
          </div>
          <CardTitle className="text-xl font-semibold">
            {stepConfig[step].title}
          </CardTitle>
          <CardDescription className="mt-1">
            {stepConfig[step].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Отправка..." : "Получить код"}
              </Button>
            </form>
          )}

          {step === "code" && (
            <form ref={otpFormRef} onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Код подтверждения</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000"
                  maxLength={4}
                  value={code}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  className="text-center font-mono text-lg tracking-[0.3em]"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Проверка..." : "Войти"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
              >
                <ArrowLeft className="mr-1.5 size-3.5" />
                Другой email
              </Button>
            </form>
          )}

          {step === "totp" && (
            <form ref={totpFormRef} onSubmit={handleTotpVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Код аутентификатора</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={8}
                  value={totpCode}
                  onChange={(e) => handleTotpChange(e.target.value)}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  className="text-center font-mono text-lg tracking-[0.3em]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Или используйте один из резервных кодов
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Проверка..." : "Подтвердить"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setTotpCode("");
                  setTotpToken("");
                  setError("");
                }}
              >
                <ArrowLeft className="mr-1.5 size-3.5" />
                Начать заново
              </Button>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
