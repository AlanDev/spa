import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID del profesional requerido" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Fecha de inicio y fin requeridas" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Crear filtro de rango de fechas usando construcción local para evitar problemas de zona horaria
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    // Buscar citas del profesional para el rango de fechas
    const bookings = await Booking.find({
      professionalId: professionalId,
      date: {
        $gte: start,
        $lte: end
      },
      status: { $ne: 'cancelled' } // Excluir canceladas
    }).sort({ date: 1, timeSlot: 1 }); // Ordenar por fecha y luego por hora

    return NextResponse.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      period: {
        startDate: startDate,
        endDate: endDate,
        days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error("Error fetching professional bookings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 