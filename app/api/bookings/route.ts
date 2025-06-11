import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import Service from "@/models/service";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";
import { sendBookingConfirmationEmail } from "@/lib/email";

// GET - Obtener reservas del usuario actual
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
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let query = {};
    
    // Si es cliente, solo ver sus propias reservas
    if (decoded.role === "cliente") {
      query = { userId: decoded.id };
    }
    // Si es profesional, ver solo las reservas asignadas a él
    else if (decoded.role === "professional") {
      query = { professionalId: decoded.id };
    }
    // Si es dra_ana_felicidad, ver todas las reservas (query vacío)

    const bookings = await Booking.find(query)
      .populate("services.serviceId")
      .populate("professionalId")
      .sort({ date: -1 });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva reserva
export async function POST(request: NextRequest) {
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
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const { serviceId, date, timeSlot, notes } = await request.json();

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Service ID y fecha son requeridos" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Obtener el usuario completo para el nombre y email
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el servicio existe
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la fecha es válida (no en el pasado)
    // Usar construcción local para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Comparar solo fechas, no horas
    
    if (bookingDate < now) {
      return NextResponse.json(
        { error: "No se pueden hacer reservas en el pasado" },
        { status: 400 }
      );
    }

    // Verificar restricción de 48 horas
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursDifference < 48) {
      return NextResponse.json(
        { error: "Las reservas deben hacerse con al menos 48 horas de anticipación" },
        { status: 400 }
      );
    }

    // Buscar un profesional disponible
    // Simplificado: asignar cualquier profesional disponible
    const availableProfessionals = await User.find({ 
      role: 'professional',
      isActive: true
    });

    let assignedProfessional = null;
    if (availableProfessionals.length > 0) {
      // Seleccionar un profesional (por simplicidad, el primero)
      assignedProfessional = availableProfessionals[0];
    }

    // Crear la reserva
    const booking = new Booking({
      userId: decoded.id,
      userName: `${user.firstName} ${user.lastName}`,
      professionalId: assignedProfessional?._id,
      professionalName: assignedProfessional ? `${assignedProfessional.firstName} ${assignedProfessional.lastName}` : undefined,
      services: [{
        serviceId: service._id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        serviceCategory: service.category,
        serviceSubcategory: service.subcategory,
      }],
      date: bookingDate,
      timeSlot: timeSlot || "09:00",
      status: "confirmed",
      payment: {
        amount: service.price,
        originalAmount: service.price,
        discount: 0,
        paid: false,
        receiptSent: false,
      },
      notes: notes,
      reservedAt: new Date(),
      canModify: true,
    });

    await booking.save();
    await booking.populate("services.serviceId");

    // Enviar email de confirmación
    try {
      const emailSent = await sendBookingConfirmationEmail({
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        services: [{
          serviceName: service.name,
          servicePrice: service.price,
          serviceDuration: service.duration,
          serviceCategory: service.category,
        }],
        date: bookingDate,
        timeSlot: timeSlot || "09:00",
        professionalName: assignedProfessional ? `${assignedProfessional.firstName} ${assignedProfessional.lastName}` : undefined,
        bookingId: booking._id.toString(),
        totalAmount: service.price,
        notes: notes,
      });

      if (emailSent) {
        console.log(`✅ Email de confirmación enviado exitosamente a ${user.email}`);
        // Marcar que el email fue enviado
        booking.payment.receiptSent = true;
        await booking.save();
      }
    } catch (emailError) {
      console.error('⚠️ Error enviando email de confirmación:', emailError);
      // No fallar la reserva si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente",
      booking: booking,
      emailSent: booking.payment.receiptSent
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
