import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 SUMMARY API: Starting report generation");

    // Verify authentication
    const token = request.cookies.get("spa-auth-token")?.value;
    if (!token) {
      console.log("❌ SUMMARY API: No token provided");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log("❌ SUMMARY API: Invalid token");
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Check if user is authorized (only Dra. Ana Felicidad)
    if (decoded.role !== "dra_ana_felicidad") {
      console.log("❌ SUMMARY API: Unauthorized role:", decoded.role);
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await dbConnect();

    // Get current date info
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate start of week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    startOfWeek.setDate(today.getDate() - daysToMonday);

    // Calculate start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log("🔍 SUMMARY API: Date ranges:", {
      today: today.toISOString(),
      startOfWeek: startOfWeek.toISOString(),
      startOfMonth: startOfMonth.toISOString()
    });

    // Get all bookings for calculations
    const allBookings = await Booking.find({
      status: { $in: ["confirmed", "completed"] }
    });

    console.log("🔍 SUMMARY API: Found bookings:", allBookings.length);

    // Filter bookings by date ranges
    const todayBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= today && bookingDate < tomorrow;
    });

    const weekBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startOfWeek;
    });

    const monthBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startOfMonth;
    });

    console.log("🔍 SUMMARY API: Filtered bookings:", {
      today: todayBookings.length,
      week: weekBookings.length,
      month: monthBookings.length
    });

    // Calculate revenue
    const calculateRevenue = (bookings: any[]) => {
      return bookings.reduce((total, booking) => {
        return total + (booking.payment?.amount || 0);
      }, 0);
    };

    // Calculate top services
    const serviceStats: { [key: string]: number } = {};
    allBookings.forEach(booking => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service: any) => {
          const serviceName = service.serviceName || service.name || "Servicio sin nombre";
          serviceStats[serviceName] = (serviceStats[serviceName] || 0) + 1;
        });
      }
    });

    const topServices = Object.entries(serviceStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate top professionals
    const professionalStats: { [key: string]: number } = {};
    allBookings.forEach(booking => {
      const professionalName = booking.professionalName || "Sin asignar";
      professionalStats[professionalName] = (professionalStats[professionalName] || 0) + 1;
    });

    const topProfessionals = Object.entries(professionalStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, bookings]) => ({ name, bookings }));

    const summary = {
      today: {
        appointments: todayBookings.length,
        revenue: calculateRevenue(todayBookings)
      },
      thisWeek: {
        appointments: weekBookings.length,
        revenue: calculateRevenue(weekBookings)
      },
      thisMonth: {
        appointments: monthBookings.length,
        revenue: calculateRevenue(monthBookings)
      },
      topServices,
      topProfessionals
    };

    console.log("✅ SUMMARY API: Summary calculated:", summary);

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error("❌ SUMMARY API: Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 