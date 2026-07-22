"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Car,
  ImageIcon,
  Menu,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const links = [
  ["/admin", "Genel Bakış", BarChart3],
  ["/admin/vehicles", "Araçlar", Car],
  ["/admin/bookings", "Rezervasyonlar", CalendarDays],
  ["/admin/users", "Kullanıcılar", Users],
  ["/admin/campaigns", "Kampanyalar", Tags],
  ["/admin/media", "Medya", ImageIcon],
  ["/admin/settings", "Ayarlar", Settings],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (isLoading)
    return (
      <div className="container-premium min-h-screen pt-32 text-slate-400">
        Yetki kontrol ediliyor…
      </div>
    );
  if (!user || user.role !== "admin")
    return (
      <div className="container-premium min-h-[70vh] pt-32">
        <div className="glass mx-auto max-w-lg rounded-3xl p-8 text-center">
          <h1 className="text-2xl font-semibold">Yönetici erişimi gerekli</h1>
          <p className="mt-3 text-slate-400">
            Bu alana erişmek için yönetici hesabıyla giriş yapın.
          </p>
          <Link href="/">
            <Button className="mt-6">Ana sayfaya dön</Button>
          </Link>
        </div>
      </div>
    );
  const nav = (
    <>
      <div className="mb-7 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="relative mb-2 h-20 w-20">
            <Image
              src="/logo.png"
              alt="ASK RENT A CAR"
              fill
              sizes="80px"
              className="object-contain object-left drop-shadow-[0_4px_18px_rgba(200,169,106,0.3)]"
            />
          </div>
          <p className="font-semibold">Yönetim Paneli</p>
        </div>
        <button
          className="lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Menüyü kapat"
        >
          <X />
        </button>
      </div>
      <nav aria-label="Yönetim menüsü" className="space-y-1">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-300 transition hover:bg-white/10",
              pathname === href && "bg-white/10 text-gold",
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
  return (
    <div className="container-premium min-h-screen pb-20 pt-24 sm:pt-28">
      <Button
        size="sm"
        variant="secondary"
        className="mb-4 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={18} /> Menü
      </Button>
      {open && (
        <button
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#020617] p-6 transition-transform lg:inset-y-24 lg:left-[max(1rem,calc((100vw-1400px)/2))] lg:z-10 lg:h-[calc(100vh-7rem)] lg:translate-x-0 lg:rounded-3xl lg:border",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {nav}
      </aside>
      <main className="lg:pl-[19rem]">{children}</main>
    </div>
  );
}
