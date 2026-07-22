"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import type { LocaleCode } from "@/types";

const copy: Record<
  LocaleCode,
  {
    title: string;
    demoHint: string;
    email: string;
    password: string;
    submit: string;
    createAccount: string;
    forgotPassword: string;
  }
> = {
  tr: {
    title: "Giriş",
    demoHint:
      "Demo müşteri: demo@askrentacar.com / Demo123!\nAdmin: admin@askrentacar.com / Admin123!",
    email: "E-posta",
    password: "Şifre",
    submit: "Giriş yap",
    createAccount: "Hesap oluştur",
    forgotPassword: "Şifremi unuttum?",
  },
  en: {
    title: "Login",
    demoHint:
      "Demo customer: demo@askrentacar.com / Demo123!\nAdmin: admin@askrentacar.com / Admin123!",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    createAccount: "Create account",
    forgotPassword: "Forgot password?",
  },
  ru: {
    title: "Вход",
    demoHint:
      "Демо-клиент: demo@askrentacar.com / Demo123!\nАдмин: admin@askrentacar.com / Admin123!",
    email: "Эл. почта",
    password: "Пароль",
    submit: "Войти",
    createAccount: "Создать аккаунт",
    forgotPassword: "Забыли пароль?",
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const t = copy[locale];
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@askrentacar.com", password: "Demo123!" },
  });

  return (
    <div className="container-premium flex justify-center pb-20 pt-28">
      <Card className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="whitespace-pre-line text-sm text-slate-400">{t.demoHint}</p>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await login(values.email, values.password);
            router.push("/account");
          })}
        >
          <div>
            <Label htmlFor="login-email">{t.email}</Label>
            <Input id="login-email" type="email" autoComplete="email" aria-label={t.email} {...form.register("email")} />
          </div>
          <div>
            <Label htmlFor="login-password">{t.password}</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-label={t.password}
              {...form.register("password")}
            />
          </div>
          <Button className="w-full" type="submit">
            {t.submit}
          </Button>
        </form>
        <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <Link href="/register" className="hover:text-white">
            {t.createAccount}
          </Link>
          <Link href="/forgot-password" className="hover:text-white">
            {t.forgotPassword}
          </Link>
        </div>
      </Card>
    </div>
  );
}
