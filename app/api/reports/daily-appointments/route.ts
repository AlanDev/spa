import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import { verifyTokenEdge } from "@/lib/auth-edge";

export async function GET(request: NextRequest) {
  try {
    console.log("📊 DAILY REPORT: Starting daily report generation...");
    
    // Get token from cookies
    const token = request.cookies.get("spa-auth-token")?.value;
    console.log("📊 DAILY REPORT: Token found:", token ? "YES" : "NO");
    
    if (!token) {
      console.log("📊 DAILY REPORT: No token, returning 401");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verify token
    console.log("📊 DAILY REPORT: Verifying token...");
    const decoded = await verifyTokenEdge(token);
    console.log("📊 DAILY REPORT: Token decoded:", decoded ? "YES" : "NO");
    console.log("📊 DAILY REPORT: User data:", decoded);
    
    if (!decoded) {
      console.log("📊 DAILY REPORT: Invalid token, returning 401");
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    
    // Check permissions
    console.log("📊 DAILY REPORT: Checking permissions for role:", decoded.role);
    if (decoded.role !== "dra_ana_felicidad" && decoded.role !== "professional") {
      console.log("📊 DAILY REPORT: Insufficient permissions, returning 403");
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    console.log("📊 DAILY REPORT: Requested date:", date);

    if (!date) {
      console.log("📊 DAILY REPORT: No date provided, returning 400");
      return NextResponse.json(
        { error: "Fecha es requerida" },
        { status: 400 }
      );
    }

    // Crear fecha local sin problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

    console.log("📊 DAILY REPORT: Date range:", targetDate, "to", nextDay);
    console.log("📊 DAILY REPORT: Connecting to database...");
    await connectToDatabase();

    console.log("📊 DAILY REPORT: Querying bookings...");
    const bookings = await Booking.find({
      date: {
        $gte: targetDate,
        $lt: nextDay,
      },
    }).sort({ timeSlot: 1 });

    console.log("📊 DAILY REPORT: Found bookings:", bookings.length);
    console.log("📊 DAILY REPORT: Raw bookings data:", JSON.stringify(bookings, null, 2));

    const summary = {
      totalAppointments: bookings.length,
      confirmedAppointments: bookings.filter(b => b.status === "confirmed").length,
      pendingAppointments: bookings.filter(b => b.status === "rescheduled").length,
      cancelledAppointments: bookings.filter(b => b.status === "cancelled").length,
      totalRevenue: bookings
        .filter(b => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
    };

    console.log("📊 DAILY REPORT: Summary calculated:", summary);

    const report = {
      date: date,
      summary,
      appointments: bookings.map(booking => ({
        id: booking._id,
        time: booking.timeSlot,
        service: booking.services && booking.services.length > 0 
          ? booking.services[0].serviceName 
          : "Servicio desconocido",
        professional: booking.professionalName || "Sin asignar",
        client: booking.userName,
        status: booking.status,
        price: booking.payment?.amount || 0,
        phone: "No disponible",
        email: "No disponible",
      })),
    };

    console.log("📊 DAILY REPORT: Report generated successfully");
    return NextResponse.json({ report });
  } catch (error) {
    console.error("📊 DAILY REPORT: Error generating report:", error);
    if (error instanceof Error) {
      console.error("📊 DAILY REPORT: Error name:", error.name);
      console.error("📊 DAILY REPORT: Error message:", error.message);
      console.error("📊 DAILY REPORT: Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 