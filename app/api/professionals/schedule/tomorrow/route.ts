import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("spa-auth-token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    await connectToDatabase();

    const bookings = await Booking.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
      status: "confirmed",
    }).sort({ timeSlot: 1 });

    const schedule = bookings.map(booking => ({
      id: booking._id,
      time: booking.timeSlot,
      service: booking.services && booking.services.length > 0 
        ? booking.services[0].serviceName 
        : "Servicio desconocido",
      professional: booking.professionalName || "Sin asignar",
      client: booking.userName,
      phone: "No disponible",
      email: "No disponible",
    }));

    return NextResponse.json({ 
      date: tomorrow.toISOString().split("T")[0],
      schedule 
    });
  } catch (error) {
    console.error("Error fetching tomorrow's schedule:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 