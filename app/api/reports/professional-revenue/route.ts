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
    }).populate("professional", "firstName lastName");

    const revenueByProfessional = bookings.reduce((acc: any, booking: any) => {
      const professionalName = booking.professional 
        ? `${booking.professional.firstName} ${booking.professional.lastName}`
        : "Profesional desconocido";

      if (!acc[professionalName]) {
        acc[professionalName] = {
          name: professionalName,
          revenue: booking.totalPrice || 0,
          bookings: 0,
        };
      }

      acc[professionalName].revenue += booking.totalPrice || 0;
      acc[professionalName].bookings += 1;
      return acc;
    }, {});

    const report = Object.values(revenueByProfessional).sort(
      (a: any, b: any) => b.revenue - a.revenue
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error generating professional revenue report:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 