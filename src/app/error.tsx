"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-premium flex min-h-[60vh] flex-col items-center justify-center gap-4 pb-20 pt-28 text-center">
      <h1 className="text-3xl font-semibold">Bir şeyler ters gitti</h1>
      <p className="max-w-md text-slate-400">Beklenmeyen bir uygulama hatası oluştu.</p>
      <Button onClick={reset}>Tekrar dene</Button>
    </div>
  );
}
