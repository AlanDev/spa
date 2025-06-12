import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import User from "@/models/user";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el usuario es profesional
    const user = await User.findById(decoded.id);
    if (!user || (user.role !== "professional" && user.role !== "dra_ana_felicidad")) {
      return NextResponse.json(
        { error: "Solo los profesionales pueden ver el historial de clientes" },
        { status: 403 }
      );
    }

    const clientId = params.id;

    // Buscar todas las reservas del cliente, ordenadas por fecha (más recientes primero)
    const bookings = await Booking.find({ 
      userId: clientId 
    })
    .sort({ date: -1, timeSlot: -1 })
    .populate('services.serviceId', 'name category subcategory');

    if (bookings.length === 0) {
      return NextResponse.json({
        clientHistory: [],
        clientInfo: null,
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          favoriteServices: [],
          lastVisit: null,
        }
      });
    }

    // Obtener información básica del cliente (del primer booking)
    const clientInfo = {
      userId: bookings[0].userId,
      userName: bookings[0].userName,
    };

    // Calcular estadísticas
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.payment.amount, 0);
    
    // Servicios favoritos (más frecuentes)
    const serviceCount: { [key: string]: number } = {};
    completedBookings.forEach(booking => {
      booking.services.forEach(service => {
        serviceCount[service.serviceName] = (serviceCount[service.serviceName] || 0) + 1;
      });
    });

    const favoriteServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([service, count]) => ({ service, count }));

    const lastVisit = completedBookings.length > 0 ? completedBookings[0].date : null;

    const stats = {
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      totalSpent,
      favoriteServices,
      lastVisit,
    };

    return NextResponse.json({
      clientHistory: bookings,
      clientInfo,
      stats,
    });
  } catch (error) {
    console.error("Error fetching client history:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 