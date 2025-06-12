import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/booking";
import User from "@/models/user";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Solo los profesionales pueden agregar notas de tratamiento" },
        { status: 403 }
      );
    }

    const { notes } = await request.json();

    if (!notes || notes.trim() === "") {
      return NextResponse.json(
        { error: "Las notas del tratamiento son requeridas" },
        { status: 400 }
      );
    }

    const bookingId = params.id;

    // Buscar la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el profesional puede editar esta reserva
    if (booking.professionalId && booking.professionalId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta reserva" },
        { status: 403 }
      );
    }

    // Verificar que la reserva esté completada
    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Solo se pueden agregar notas a reservas completadas" },
        { status: 400 }
      );
    }

    // Actualizar con las notas del tratamiento
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        treatmentNotes: {
          notes: notes.trim(),
          addedAt: new Date(),
          addedBy: user._id,
          addedByName: `${user.firstName} ${user.lastName}`,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Notas del tratamiento agregadas exitosamente",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error adding treatment notes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Solo los profesionales pueden editar notas de tratamiento" },
        { status: 403 }
      );
    }

    const { notes } = await request.json();

    if (!notes || notes.trim() === "") {
      return NextResponse.json(
        { error: "Las notas del tratamiento son requeridas" },
        { status: 400 }
      );
    }

    const bookingId = params.id;

    // Buscar la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el profesional puede editar esta reserva
    if (booking.professionalId && booking.professionalId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta reserva" },
        { status: 403 }
      );
    }

    // Actualizar las notas del tratamiento
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        "treatmentNotes.notes": notes.trim(),
        "treatmentNotes.addedAt": new Date(),
        "treatmentNotes.addedBy": user._id,
        "treatmentNotes.addedByName": `${user.firstName} ${user.lastName}`,
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Notas del tratamiento actualizadas exitosamente",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating treatment notes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 