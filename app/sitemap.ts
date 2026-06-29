import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://factiram.com";

  const productos = await prisma.abastosProducto.findMany({
    where: { activo: true },
    select: { slug: true, updatedAt: true },
  });

  const productEntries: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${baseUrl}/precios/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/precios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
