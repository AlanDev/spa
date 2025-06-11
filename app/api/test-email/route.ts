import { NextRequest, NextResponse } from "next/server";
import { verifyEmailConfig, sendBookingConfirmationEmail } from "@/lib/email";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (solo administradores pueden probar)
    const token = request.cookies.get("spa-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: "Email de prueba requerido" },
        { status: 400 }
      );
    }

    // Verificar configuración de email
    const isConfigValid = await verifyEmailConfig();
    
    if (!isConfigValid) {
      return NextResponse.json(
        { 
          error: "Configuración de email inválida",
          config: {
            valid: false,
            message: "No se pudo conectar al servidor SMTP"
          }
        },
        { status: 500 }
      );
    }

    // Datos de prueba
    const testBookingData = {
      customerName: 'Usuario de Prueba',
      customerEmail: testEmail,
      services: [
        {
          serviceName: 'Masaje Relajante (PRUEBA)',
          servicePrice: 9500,
          serviceDuration: 60,
          serviceCategory: 'Masajes'
        }
      ],
      date: new Date(),
      timeSlot: '14:30',
      professionalName: 'Profesional de Prueba',
      bookingId: 'TEST' + Date.now(),
      totalAmount: 9500,
      notes: 'Este es un email de prueba del sistema de reservas.'
    };

    // Enviar email de prueba
    const emailSent = await sendBookingConfirmationEmail(testBookingData);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Email de prueba enviado exitosamente",
        data: {
          recipient: testEmail,
          bookingId: testBookingData.bookingId,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: "Error enviando email de prueba",
          config: {
            valid: true,
            message: "Configuración SMTP válida pero error en el envío"
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error testing email system:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get("spa-auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Verificar configuración de email
    const isConfigValid = await verifyEmailConfig();

    return NextResponse.json({
      emailSystem: {
        configured: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: process.env.SMTP_USER || "alanqienar@gmail.com",
        connectionValid: isConfigValid,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error checking email config:", error);
    return NextResponse.json(
      { 
        error: "Error verificando configuración de email",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
} 