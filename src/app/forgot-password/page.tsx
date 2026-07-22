"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { authService } from "@/services";
import { useLocale } from "@/providers/locale-provider";
import type { LocaleCode } from "@/types";

const copy: Record<
  LocaleCode,
  {
    title: string;
    description: string;
    email: string;
    submit: string;
    submitting: string;
    success: string;
    failed: string;
  }
> = {
  tr: {
    title: "Şifre sıfırla",
    description: "Demo sıfırlama akışı — bu demoda gerçek e-posta gönderilmez.",
    email: "E-posta",
    submit: "Sıfırlama bağlantısı gönder",
    submitting: "Gönderiliyor…",
    success: "Mock sıfırlama bağlantısı gönderildi. Giriş için Demo123! veya mevcut şifrenizi kullanın.",
    failed: "Sıfırlama başarısız",
  },
  en: {
    title: "Reset password",
    description: "Mock reset flow — no real email is sent in this demo.",
    email: "Email",
    submit: "Send reset link",
    submitting: "Sending…",
    success: "Mock reset link sent. Use Demo123! or your current password to sign in.",
    failed: "Reset failed",
  },
  ru: {
    title: "Сброс пароля",
    description: "Демо-сброс — в этой демо-версии реальное письмо не отправляется.",
    email: "Эл. почта",
    submit: "Отправить ссылку для сброса",
    submitting: "Отправка…",
    success: "Демо-ссылка для сброса отправлена. Войдите с Demo123! или текущим паролем.",
    failed: "Сброс не удался",
  },
};

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [email, setEmail] = useState("demo@askrentacar.com");
  const [loading, setLoading] = useState(false);

  return (
    <div className="container-premium flex justify-center pb-20 pt-28">
      <Card className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-slate-400">{t.description}</p>
        <div>
          <Label htmlFor="forgot-email">{t.email}</Label>
          <Input
            id="forgot-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            aria-label={t.email}
          />
        </div>
        <Button
          className="w-full"
          disabled={loading}
          aria-busy={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await authService.reset(email);
              toast.success(t.success);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t.failed);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? t.submitting : t.submit}
        </Button>
      </Card>
    </div>
  );
}
