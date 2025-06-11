import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";

// GET - Obtener profesional específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar que el usuario actual es Dra. Ana Felicidad
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Solo la Dra. Ana Felicidad puede ver los profesionales" },
        { status: 403 }
      );
    }

    const professionalId = params.id;
    const professional = await User.findById(professionalId).select("-password");

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ professional });
  } catch (error) {
    console.error("Error fetching professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar profesional
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

    await connectToDatabase();

    // Verificar que el usuario actual es Dra. Ana Felicidad
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Solo la Dra. Ana Felicidad puede editar profesionales" },
        { status: 403 }
      );
    }

    const professionalId = params.id;
    const updateData = await request.json();

    // Buscar y actualizar el profesional
    const professional = await User.findByIdAndUpdate(
      professionalId,
      {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        professionalData: updateData.professionalData,
        isActive: updateData.isActive,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profesional actualizado exitosamente",
      professional,
    });
  } catch (error) {
    console.error("Error updating professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 