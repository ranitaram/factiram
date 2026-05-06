import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import LoginClaveForm from "./LoginClaveForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const negocio = await prisma.negocio.findUnique({
    where: { slugUrl: slug },
    select: { id: true, nombre: true, slugUrl: true },
  });
  if (!negocio) notFound();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm text-center">
        <h1 className="text-2xl font-black text-blue-600 mb-1">FACTIRAM</h1>
        <p className="text-gray-500 text-sm mb-6">{negocio.nombre}</p>
        <LoginClaveForm slug={negocio.slugUrl} />
      </div>
    </div>
  );
}
