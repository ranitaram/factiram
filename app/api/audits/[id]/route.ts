import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Declaramos que params es una Promesa
) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. ¡EL FIX! Debemos esperar (await) a que los params se resuelvan
    const { id } = await params;

    // Ahora auditId ya tiene el texto real (ej: "85ac3ca0...")
    await prisma.audit.delete({
      where: {
        id: id,
        user: { email: session.user.email }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar auditoría:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro" }, 
      { status: 500 }
    );
  }
}