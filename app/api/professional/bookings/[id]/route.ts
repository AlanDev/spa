import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Estado requerido" },
        { status: 400 }
      );
    }

    // Validar estados permitidos
    const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar y actualizar la cita
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el estado
    booking.status = status;
    
    // Si se marca como completado, actualizar fecha de pago si no estaba pagado
    if (status === 'completed' && !booking.payment.paid) {
      booking.payment.paid = true;
      booking.payment.paidAt = new Date();
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Estado de la cita actualizado exitosamente",
      booking: booking
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 