import type { Metadata } from "next";
import { VehicleDetail } from "@/components/vehicle/vehicle-detail";
import { createSeedDatabase } from "@/mock/seed";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return createSeedDatabase()
    .vehicles.slice(0, 24)
    .map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = createSeedDatabase().vehicles.find((v) => v.slug === slug);
  if (!vehicle) return { title: "Araç" };
  const image = vehicle.images[0]?.url;
  return {
    title: `${vehicle.brand} ${vehicle.model}`,
    description: vehicle.description.tr,
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model}`,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <VehicleDetail slug={slug} />;
}
