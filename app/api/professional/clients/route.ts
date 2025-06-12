import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import User from "@/models/user";

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

    // Verificar que el usuario es profesional
    const user = await User.findById(decoded.id);
    if (!user || (user.role !== "professional" && user.role !== "dra_ana_felicidad")) {
      return NextResponse.json(
        { error: "Solo los profesionales pueden ver la lista de clientes" },
        { status: 403 }
      );
    }

    // Buscar todas las reservas y agrupar por cliente
    const bookings = await Booking.find({}).sort({ date: -1 });

    // Agrupar por userId y calcular estadísticas
    const clientsMap = new Map();

    bookings.forEach(booking => {
      const clientId = booking.userId;
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          userId: clientId,
          userName: booking.userName,
          totalBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          lastVisit: null,
        });
      }

      const client = clientsMap.get(clientId);
      client.totalBookings++;

      if (booking.status === 'completed') {
        client.completedBookings++;
        client.totalSpent += booking.payment.amount;
        
        // Actualizar última visita si es más reciente
        if (!client.lastVisit || new Date(booking.date) > new Date(client.lastVisit)) {
          client.lastVisit = booking.date;
        }
      }
    });

    // Convertir a array y ordenar por última visita
    const clients = Array.from(clientsMap.values()).sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) return 0;
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });

    return NextResponse.json({
      clients,
      total: clients.length,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 