import { Suspense } from "react";
import VehiclesPage from "./vehicles-client";
import { Skeleton } from "@/components/ui/primitives";

export const metadata = {
  title: "Araç Filosu",
  description: "Kuzey Kıbrıs'taki premium kiralık araçları inceleyin.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="container-premium grid gap-4 pb-20 pt-28 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      }
    >
      <VehiclesPage />
    </Suspense>
  );
}
