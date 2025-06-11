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
    
    // Check permissions
    if (decoded.role !== "dra_ana_felicidad" && decoded.role !== "professional") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectToDatabase();

    const bookings = await Booking.find({
      status: "confirmada",
    }).populate("service", "name price");

    const revenueByService = bookings.reduce((acc: any, booking: any) => {
      const serviceName = booking.service?.name || "Servicio desconocido";
      const servicePrice = booking.service?.price || 0;

      if (!acc[serviceName]) {
        acc[serviceName] = {
          name: serviceName,
          revenue: 0,
          bookings: 0,
        };
      }

      acc[serviceName].revenue += servicePrice;
      acc[serviceName].bookings += 1;
      return acc;
    }, {});

    const report = Object.values(revenueByService).sort(
      (a: any, b: any) => b.revenue - a.revenue
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error generating service revenue report:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 