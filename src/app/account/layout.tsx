"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  Heart,
  LayoutDashboard,
  Receipt,
  UserRound,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/utils/cn";
import type { LocaleCode } from "@/types";

const copy: Record<
  LocaleCode,
  {
    loading: string;
    requiredTitle: string;
    requiredBody: string;
    login: string;
    navAria: string;
    links: {
      dashboard: string;
      profile: string;
      bookings: string;
      favorites: string;
      documents: string;
      invoices: string;
      notifications: string;
    };
  }
> = {
  tr: {
    loading: "Hesap yükleniyor…",
    requiredTitle: "Hesap gerekli",
    requiredBody: "Panelinize erişmek için lütfen giriş yapın.",
    login: "Giriş",
    navAria: "Hesap menüsü",
    links: {
      dashboard: "Panel",
      profile: "Profil",
      bookings: "Rezervasyonlar",
      favorites: "Favoriler",
      documents: "Belgeler",
      invoices: "Faturalar",
      notifications: "Bildirimler",
    },
  },
  en: {
    loading: "Loading account…",
    requiredTitle: "Account required",
    requiredBody: "Please sign in to access your dashboard.",
    login: "Login",
    navAria: "Account navigation",
    links: {
      dashboard: "Dashboard",
      profile: "Profile",
      bookings: "Bookings",
      favorites: "Favorites",
      documents: "Documents",
      invoices: "Invoices",
      notifications: "Notifications",
    },
  },
  ru: {
    loading: "Загрузка аккаунта…",
    requiredTitle: "Требуется аккаунт",
    requiredBody: "Войдите, чтобы открыть личный кабинет.",
    login: "Вход",
    navAria: "Меню аккаунта",
    links: {
      dashboard: "Панель",
      profile: "Профиль",
      bookings: "Бронирования",
      favorites: "Избранное",
      documents: "Документы",
      invoices: "Счета",
      notifications: "Уведомления",
    },
  },
};

const linkDefs = [
  { href: "/account", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/account/profile", key: "profile" as const, icon: UserRound },
  { href: "/account/bookings", key: "bookings" as const, icon: CalendarDays },
  { href: "/account/favorites", key: "favorites" as const, icon: Heart },
  { href: "/account/documents", key: "documents" as const, icon: FileText },
  { href: "/account/invoices", key: "invoices" as const, icon: Receipt },
  { href: "/account/notifications", key: "notifications" as const, icon: Bell },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = copy[locale];

  if (isLoading) {
    return (
      <div className="container-premium pb-20 pt-28" role="status" aria-live="polite">
        {t.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-premium flex justify-center pb-20 pt-28">
        <Card className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">{t.requiredTitle}</h1>
          <p className="text-slate-400">{t.requiredBody}</p>
          <Link href="/login">
            <Button className="w-full">{t.login}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-premium grid gap-6 pb-20 pt-28 lg:grid-cols-[240px_1fr]">
      <aside className="glass h-fit rounded-3xl p-3">
        <div className="mb-3 px-2 text-sm text-slate-400">
          {user.firstName} {user.lastName}
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label={t.navAria}>
          {linkDefs.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            const label = t.links[link.key];
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2 text-sm hover:bg-white/10",
                  active && "bg-accent text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
