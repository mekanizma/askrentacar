"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import type { LocaleCode } from "@/types";

const copy: Record<
  LocaleCode,
  {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    submit: string;
    alreadyHave: string;
    login: string;
  }
> = {
  tr: {
    title: "Hesap oluştur",
    firstName: "Ad",
    lastName: "Soyad",
    email: "E-posta",
    phone: "Telefon",
    password: "Şifre",
    confirmPassword: "Şifre tekrar",
    submit: "Kayıt ol",
    alreadyHave: "Zaten hesabınız var mı?",
    login: "Giriş",
  },
  en: {
    title: "Create account",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    password: "Password",
    confirmPassword: "Confirm password",
    submit: "Register",
    alreadyHave: "Already have an account?",
    login: "Login",
  },
  ru: {
    title: "Создать аккаунт",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Эл. почта",
    phone: "Телефон",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    submit: "Зарегистрироваться",
    alreadyHave: "Уже есть аккаунт?",
    login: "Вход",
  },
};

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

function RegisterForm() {
  const { register: signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = copy[locale];
  const nextPath = safeNextPath(searchParams.get("next"));
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Card className="w-full max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          await signUp(values);
          router.push(nextPath);
        })}
      >
        <div>
          <Label htmlFor="register-firstName">{t.firstName}</Label>
          <Input
            id="register-firstName"
            autoComplete="given-name"
            aria-label={t.firstName}
            {...form.register("firstName")}
          />
        </div>
        <div>
          <Label htmlFor="register-lastName">{t.lastName}</Label>
          <Input
            id="register-lastName"
            autoComplete="family-name"
            aria-label={t.lastName}
            {...form.register("lastName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="register-email">{t.email}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-label={t.email}
            {...form.register("email")}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="register-phone">{t.phone}</Label>
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            aria-label={t.phone}
            {...form.register("phone")}
          />
        </div>
        <div>
          <Label htmlFor="register-password">{t.password}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-label={t.password}
            {...form.register("password")}
          />
        </div>
        <div>
          <Label htmlFor="register-confirmPassword">{t.confirmPassword}</Label>
          <Input
            id="register-confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-label={t.confirmPassword}
            {...form.register("confirmPassword")}
          />
        </div>
        <div className="sm:col-span-2">
          <Button className="w-full" type="submit">
            {t.submit}
          </Button>
        </div>
      </form>
      <p className="text-sm text-slate-400">
        {t.alreadyHave}{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="text-gold"
        >
          {t.login}
        </Link>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="container-premium flex justify-center pb-20 pt-28">
      <Suspense
        fallback={
          <Card className="w-full max-w-lg p-6 text-sm text-slate-400">
            …
          </Card>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
