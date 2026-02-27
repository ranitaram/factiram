import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import  prisma  from '@/lib/prisma';

// Forzamos el entorno de Node.js para permitir la lectura de archivos físicos
export const runtime = 'nodejs';

// Configuración de archivos
const DOWNLOAD_FILENAME = 'SISTEMA-FACTIRAM.pdf'; // Nombre que verá el cliente al bajarlo
const STORAGE_FILENAME = 'Sistema-FactiRam.pdf'; // Nombre real del archivo en tu carpeta /storage

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // 1) Validar que el token esté presente en la URL
    if (!token) {
      return NextResponse.json(
        { error: 'Token de descarga requerido' },
        { status: 400 }
      );
    }

    // 2) Buscar la compra usando findUnique (Usa el índice único para máxima velocidad)
    const purchase = await prisma.purchase.findUnique({
      where: {
        downloadToken: token,
      },
    });

    // Validar existencia y que el pago esté confirmado
    if (!purchase || purchase.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Acceso denegado: Compra no encontrada o no pagada' },
        { status: 403 }
      );
    }

    // 3) Validar si el enlace de 30 días ya expiró
    if (
      purchase.downloadExpiresAt &&
      new Date() > purchase.downloadExpiresAt
    ) {
      return NextResponse.json(
        { error: 'El enlace de descarga ha expirado' },
        { status: 403 }
      );
    }

    const now = new Date();
    const limit = purchase.downloadLimit ?? 3;

    // 4) COOLDOWN: Verificar tiempo entre descargas
    // Se hace ANTES del incremento para no castigar al usuario si da clics rápidos
    if (purchase.lastDownloadAt) {
      const cooldownSeconds = 10;
      const sinceSeconds =
        (now.getTime() - new Date(purchase.lastDownloadAt).getTime()) / 1000;

      if (sinceSeconds < cooldownSeconds) {
        const remaining = Math.ceil(cooldownSeconds - sinceSeconds);
        return NextResponse.json(
          { 
            error: `Espera ${remaining} segundos para volver a intentar`,
            retry_after: remaining 
          },
          { status: 429 }
        );
      }
    }

    // 5) INCREMENTO ATÓMICO: Solo si no ha superado el límite (Protección pro)
    const updateResult = await prisma.purchase.updateMany({
      where: {
        id: purchase.id,
        downloadCount: { lt: limit },
      },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: now,
      },
    });

    // Si no se actualizó nada, significa que el límite se alcanzó justo ahora
    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: `Límite de descargas alcanzado (Máximo ${limit} intentos)` },
        { status: 429 }
      );
    }

    // 6) ENTREGA DEL ARCHIVO: Lectura desde /storage en la raíz del proyecto
    const filePath = path.join(process.cwd(), 'storage', STORAGE_FILENAME);
    
    // Lectura asíncrona para no bloquear el servidor
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${DOWNLOAD_FILENAME}"`,
        // Evitamos que el navegador guarde el archivo en caché para forzar la validación del token siempre
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error('Error crítico en el endpoint de descarga:', error);

    // Si el error es porque el archivo no existe en la carpeta /storage
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'El archivo técnico no está disponible en el servidor. Contacte a soporte.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Ocurrió un error interno al procesar tu descarga' },
      { status: 500 }
    );
  }
}