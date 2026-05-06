import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";
import { crearNegocio } from "@/lib/onboarding";
import { getSemaforoAdmin } from "@/lib/factiram-access";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const negocios = await prisma.negocio.findMany({
      select: {
        id: true,
        nombre: true,
        slugUrl: true,
        activo: true,
        createdAt: true,
        suscripcion: {
          select: {
            setupPagado: true,
            trialStartedAt: true,
            proximoPagoAt: true,
          },
        },
        usuarios: {
          select: { rol: true, clave: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = negocios.map((n) => {
      const sem = n.suscripcion
        ? getSemaforoAdmin(n.suscripcion)
        : { semaforo: "ROJO" as const, mensaje: "Sin suscripción" };

      return {
        id: n.id,
        nombre: n.nombre,
        slug: n.slugUrl,
        activo: n.activo,
        semaforo: sem.semaforo,
        mensaje: sem.mensaje,
        setupPagado: n.suscripcion?.setupPagado ?? false,
        proximoPagoAt: n.suscripcion?.proximoPagoAt ?? null,
        linkDueno: `/${n.slugUrl}?modo=dueno`,
        linkCajero: `/${n.slugUrl}`,
        claveDueno: n.usuarios.find((u) => u.rol === "DUENO")?.clave ?? null,
        claveCajero: n.usuarios.find((u) => u.rol === "CAJERO")?.clave ?? null,
      };
    });

    return NextResponse.json({ negocios: data });
  } catch (error) {
    console.error("Error listando negocios:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const resultado = await crearNegocio(body as Parameters<typeof crearNegocio>[0]);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error creando negocio:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un negocio con ese slug" },
          { status: 409 }
        );
      }
    }
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
