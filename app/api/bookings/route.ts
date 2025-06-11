import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import Service from "@/models/service";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

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
    console.log('🚀 Iniciando proceso de creación de reserva...');
    
    // Verificar autenticación
    const token = request.cookies.get("spa-auth-token")?.value;

    if (!token) {
      console.log('❌ No se encontró token de autenticación');
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    console.log('🔐 Token encontrado, verificando...');
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Token inválido');
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    console.log(`✅ Usuario autenticado: ${decoded.email} (${decoded.role})`);

    const { serviceId, date, timeSlot, notes } = await request.json();
    console.log('📋 Datos recibidos:', { serviceId, date, timeSlot, notes });

    if (!serviceId || !date) {
      console.log('❌ Faltan datos requeridos:', { serviceId, date });
      return NextResponse.json(
        { error: "Service ID y fecha son requeridos" },
        { status: 400 }
      );
    }

    console.log('🔗 Conectando a la base de datos...');
    await connectToDatabase();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener el usuario completo para el nombre y email
    console.log(`👤 Buscando usuario con ID: ${decoded.id}`);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName}`);

    // Verificar que el servicio existe
    console.log(`🛍️ Buscando servicio con ID: ${serviceId}`);
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log('❌ Servicio no encontrado en la base de datos');
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }
    console.log(`✅ Servicio encontrado: ${service.name} - $${service.price}`);

    // Verificar que la fecha es válida (no en el pasado)
    let bookingDate: Date;
    
    // Detectar si es fecha ISO o formato YYYY-MM-DD
    if (date.includes('T')) {
      // Es una fecha ISO (2024-01-15T14:30:00.000Z)
      bookingDate = new Date(date);
      console.log('📅 Fecha ISO detectada:', date);
    } else {
      // Es formato YYYY-MM-DD
      const [year, month, day] = date.split('-').map(Number);
      bookingDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
      console.log('📅 Fecha YYYY-MM-DD detectada:', date);
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Comparar solo fechas, no horas
    
    const bookingDateComparison = new Date(bookingDate);
    bookingDateComparison.setHours(0, 0, 0, 0); // Para comparar solo la fecha
    
    console.log('📊 Comparando fechas - Reserva:', bookingDateComparison.toISOString(), 'Hoy:', now.toISOString());
    
    if (bookingDateComparison < now) {
      return NextResponse.json(
        { error: "No se pueden hacer reservas en el pasado" },
        { status: 400 }
      );
    }

    // Verificar restricción de 48 horas    
    const hoursDifference = (bookingDateComparison.getTime() - now.getTime()) / (1000 * 60 * 60);
    console.log('⏰ Diferencia en horas:', hoursDifference);
    
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

    console.log(`✅ Reserva creada exitosamente para usuario ${user.email}, ID: ${booking._id}`);

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente",
      booking: booking
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Error crítico creando reserva:", error);
    
    // Log más detallado del error
    if (error instanceof Error) {
      console.error("📝 Tipo de error:", error.name);
      console.error("📝 Mensaje:", error.message);
      console.error("📝 Stack trace:", error.stack);
    }
    
    // Si es un error de MongoDB, loguear detalles específicos
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("🗄️ Código de error de MongoDB:", (error as any).code);
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
