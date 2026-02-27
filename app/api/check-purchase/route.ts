import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const preferenceId = searchParams.get('preference_id');

    if (!preferenceId || preferenceId.length < 5) {
      return NextResponse.json(
        { error: 'ID de preferencia inválido' },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.findUnique({
      where: { mpPreferenceId: preferenceId },
      select: {
        status: true,
        downloadToken: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ status: 'NOT_FOUND' });
    }

    // SOLO liberar token si el pago está confirmado
    if (purchase.status !== 'PAID') {
      return NextResponse.json({
        status: purchase.status,
        downloadToken: null,
      });
    }

    return NextResponse.json({
      status: purchase.status,
      downloadToken: purchase.downloadToken,
    });

  } catch (error) {
    console.error('Error en check-purchase:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}