import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// 🚨 Importante para Vercel
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1️⃣ Solo procesamos notificaciones tipo "payment"
    if (body.type !== 'payment') {
      return new NextResponse('Ignored', { status: 200 });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return new NextResponse('Missing payment id', { status: 400 });
    }

    // 2️⃣ Validamos el pago directamente con Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mpResponse.ok) {
      console.error('Error consultando Mercado Pago');
      return new NextResponse('MP error', { status: 500 });
    }

    const paymentData = await mpResponse.json();

    // 3️⃣ Solo si está aprobado
    if (paymentData.status !== 'approved') {
      return new NextResponse('Payment not approved', { status: 200 });
    }

    const preferenceId = paymentData.preference_id;

    if (!preferenceId) {
      return new NextResponse('Missing preference id', { status: 400 });
    }

    // 4️⃣ Buscamos la compra
    const existingPurchase = await prisma.purchase.findUnique({
      where: { mpPreferenceId: preferenceId },
    });

    if (!existingPurchase) {
      console.error('Compra no encontrada en BD');
      return new NextResponse('Purchase not found', { status: 404 });
    }

    // 🛑 Protección contra duplicados (Mercado Pago reintenta webhooks)
    if (existingPurchase.status === 'PAID') {
      return new NextResponse('Already processed', { status: 200 });
    }

    // 5️⃣ Generamos token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);

    // 6️⃣ Actualizamos base de datos
    const updatedPurchase = await prisma.purchase.update({
      where: { id: existingPurchase.id },
      data: {
        status: 'PAID',
        mpPaymentId: String(paymentId),
        downloadToken: token,
        downloadExpiresAt: expiration,
        downloadLimit: 3,
      },
    });

    // 7️⃣ Construimos URL segura
    const downloadUrl = `${process.env.APP_URL}/api/download?token=${token}`;

    // 8️⃣ Enviamos correo
    await resend.emails.send({
      from: 'FACTIRAM <hola@factiram.com>',
      to: [updatedPurchase.email],
      subject: '🚀 ¡Tu Guía de Rescate FACTIRAM ya está lista!',
      html: `
        <h1>¡Gracias por confiar en FACTIRAM!</h1>
        <p>Tu pago ha sido confirmado con éxito.</p>
        <p><strong>Importante:</strong> Este enlace es personal, vence en 30 días y permite máximo 3 descargas.</p>
        <div style="margin: 20px 0;">
          <a href="${downloadUrl}" 
             style="background-color: #10B981; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            DESCARGAR GUÍA AHORA
          </a>
        </div>
        <p>Si tienes algún problema, responde a este correo.</p>
      `,
    });

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error en Webhook FACTIRAM:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}