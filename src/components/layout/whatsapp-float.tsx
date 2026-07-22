"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { BRAND } from "@/constants";
import { useLocale } from "@/providers/locale-provider";

export function WhatsAppFloat() {
  const pathname = usePathname();
  const { t } = useLocale();

  if (pathname?.startsWith("/admin")) return null;

  const href = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    t("hero.whatsappMessage"),
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile yazın"
      className="whatsapp-fab focus-ring fixed z-[180] flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/40 sm:h-12 sm:w-12"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <span className="whatsapp-fab-ping" aria-hidden="true" />
      <span className="whatsapp-fab-ping whatsapp-fab-ping-delay" aria-hidden="true" />
      <MessageCircle className="relative z-10 h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
    </a>
  );
}
