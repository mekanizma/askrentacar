import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center gap-4 pb-20 pt-28 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-gold">404</p>
      <h1 className="text-3xl font-semibold">Sayfa bulunamadı</h1>
      <p className="text-slate-400">Aradığınız sayfaya ulaşılamıyor.</p>
      <Link href="/">
        <Button>Ana sayfaya dön</Button>
      </Link>
    </div>
  );
}
