import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import { verifyToken } from "@/lib/auth";

// PATCH - Actualizar fecha y hora de reserva
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { date, timeSlot } = await request.json();
    const bookingId = params.id;

    await connectToDatabase();

    // Buscar la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario puede modificar esta reserva
    if (decoded.role === "cliente" && booking.userId !== decoded.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta reserva" },
        { status: 403 }
      );
    }

    // Verificar que la reserva se puede modificar
    if (!booking.canModify || (booking.status !== "confirmed" && booking.status !== "rescheduled")) {
      return NextResponse.json(
        { error: "Esta reserva no se puede modificar" },
        { status: 400 }
      );
    }

    // Validar nueva fecha y hora
    if (date && timeSlot) {
      // Crear fecha local sin problemas de zona horaria
      let newDate: Date;
      
      console.log('📅 Reprogramando - Fecha recibida:', date);
      
      // Detectar si es fecha ISO o formato YYYY-MM-DD
      if (date.includes('T')) {
        // Es una fecha ISO (2024-01-15T14:30:00.000Z)
        newDate = new Date(date);
        console.log('📅 PATCH - Fecha ISO detectada:', date);
      } else {
        // Es formato YYYY-MM-DD
        const [year, month, day] = date.split('-').map(Number);
        newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        console.log('📅 PATCH - Fecha YYYY-MM-DD detectada:', date);
      }
      
      // Para la validación de tiempo, usar la hora seleccionada
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const newDateTime = new Date(newDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      const now = new Date();
      
      // Verificar que la nueva fecha es válida
      if (newDateTime <= now) {
        return NextResponse.json(
          { error: "No se puede reprogramar para el pasado" },
          { status: 400 }
        );
      }

      // Verificar restricción de 48 horas
      const hoursDifference = (newDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDifference < 48) {
        return NextResponse.json(
          { error: "Las reprogramaciones deben hacerse con al menos 48 horas de anticipación" },
          { status: 400 }
        );
      }

      // Actualizar la reserva con fecha local
      booking.date = newDate;
      booking.timeSlot = timeSlot;
      booking.status = "rescheduled";
      booking.updatedAt = new Date();
      
      await booking.save();

      return NextResponse.json({
        message: "Reserva reprogramada exitosamente",
        booking: booking
      });
    } else {
      return NextResponse.json(
        { error: "Fecha y hora son requeridas" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar reserva (reprogramar)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status, date } = await request.json();
    const bookingId = params.id;

    await connectToDatabase();

    // Buscar la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario puede modificar esta reserva
    if (decoded.role === "cliente" && booking.userId !== decoded.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta reserva" },
        { status: 403 }
      );
    }

    // Si se está reprogramando
    if (status === "rescheduled" && date) {
      console.log('📅 PUT - Reprogramando - Fecha recibida:', date);
      
      // Crear fecha local sin problemas de zona horaria
      let newDate: Date;
      
      // Detectar si es fecha ISO o formato YYYY-MM-DD
      if (date.includes('T')) {
        // Es una fecha ISO (2024-01-15T14:30:00.000Z)
        newDate = new Date(date);
        console.log('📅 PUT - Fecha ISO detectada:', date);
      } else {
        // Es formato YYYY-MM-DD
        const [year, month, day] = date.split('-').map(Number);
        newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        console.log('📅 PUT - Fecha YYYY-MM-DD detectada:', date);
      }
      
      const now = new Date();
      
      // Verificar que la nueva fecha es válida
      const newDateComparison = new Date(newDate);
      newDateComparison.setHours(0, 0, 0, 0); // Para comparar solo la fecha
      now.setHours(0, 0, 0, 0); // Para comparar solo la fecha
      
      console.log('📊 PUT - Comparando fechas - Nueva:', newDateComparison.toISOString(), 'Hoy:', now.toISOString());
      
      if (newDateComparison <= now) {
        return NextResponse.json(
          { error: "No se puede reprogramar para el pasado" },
          { status: 400 }
        );
      }

      // Verificar restricción de 48 horas
      const hoursDifference = (newDateComparison.getTime() - now.getTime()) / (1000 * 60 * 60);
      console.log('⏰ PUT - Diferencia en horas:', hoursDifference);
      
      if (hoursDifference < 48) {
        return NextResponse.json(
          { error: "Las reprogramaciones deben hacerse con al menos 48 horas de anticipación" },
          { status: 400 }
        );
      }

      // Guardar fecha original si es la primera reprogramación
      if (!booking.originalDate) {
        booking.originalDate = booking.date;
      }

      booking.date = newDate;
      booking.status = "rescheduled";
    } else {
      booking.status = status;
    }

    booking.updatedAt = new Date();
    await booking.save();

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar reserva
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const bookingId = params.id;

    await connectToDatabase();

    // Buscar la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario puede cancelar esta reserva
    if (decoded.role === "cliente" && booking.userId !== decoded.id) {
      return NextResponse.json(
        { error: "No autorizado para cancelar esta reserva" },
        { status: 403 }
      );
    }

    // Marcar como cancelada en lugar de eliminar
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    await booking.save();

    return NextResponse.json({ message: "Reserva cancelada exitosamente" });
  } catch (error) {
    console.error("Error canceling booking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
