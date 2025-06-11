import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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
    
    // Check permissions - only admin can migrate
    if (decoded.role !== "dra_ana_felicidad") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await connectToDatabase();

    // Find all bookings that need migration
    const bookings = await Booking.find({});
    let migratedCount = 0;

    for (const booking of bookings) {
      let needsUpdate = false;
      const updates: any = {};

      // Remove payment method if it exists
      if (booking.toObject().hasOwnProperty('method')) {
        updates.$unset = { method: 1 };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Booking.updateOne({ _id: booking._id }, updates);
        migratedCount++;
      }
    }

    return NextResponse.json({
      message: "Migración completada",
      migratedCount,
      totalBookings: bookings.length,
    });
  } catch (error) {
    console.error("Error migrating bookings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
