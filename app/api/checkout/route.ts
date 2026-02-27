import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import crypto from 'crypto';

// ================================
// VALIDACIÓN DE VARIABLES CRÍTICAS
// ================================
if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN no está definido en las variables de entorno');
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL no está definido en las variables de entorno');
}

// ================================
// CONFIGURACIÓN DE MERCADO PAGO
// ================================
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // ================================
    // VALIDACIÓN BÁSICA DE EMAIL
    // ================================
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    // ================================
    // CREACIÓN DE PREFERENCIA
    // ================================
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'guia-rescate-199',
            title: 'Guía Maestra de Rescate FACTIRAM (51 páginas)',
            quantity: 1,
            unit_price: 199,
            currency_id: 'MXN',
          },
        ],
        back_urls: {
          success: `${process.env.APP_URL}/audit/success`,
          failure: `${process.env.APP_URL}/audit/error`,
          pending: `${process.env.APP_URL}/audit/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.APP_URL}/api/webhook`,
        metadata: {
          email,
          productId: 'guia-rescate-199',
        },
        external_reference: crypto.randomUUID(),
      },
    });

    // ================================
    // VALIDACIÓN DE RESPUESTA MP
    // ================================
    if (!result.id || !result.init_point) {
      throw new Error('Error creando la preferencia en Mercado Pago');
    }

    // ================================
    // GUARDAR INTENCIÓN EN BASE DE DATOS
    // ================================
    await prisma.purchase.create({
      data: {
        email,
        productId: 'guia-rescate-199',
        amount: 199,
        status: 'PENDING',
        mpPreferenceId: result.id,
      },
    });

    // ================================
    // RESPUESTA AL FRONTEND
    // ================================
    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error('Error al crear la orden de pago:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}