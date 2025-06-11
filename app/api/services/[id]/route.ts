import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/service";
import User from "@/models/user";

// DELETE - Eliminar servicio (solo Dra. Ana Felicidad)
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

    await connectToDatabase();

    // Verificar que el usuario actual es Dra. Ana Felicidad
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Solo la Dra. Ana Felicidad puede eliminar servicios" },
        { status: 403 }
      );
    }

    const serviceId = params.id;

    // Buscar el servicio
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    // En lugar de eliminar completamente, marcar como inactivo para preservar historial
    await Service.findByIdAndUpdate(serviceId, { 
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: decoded.id
    });

    return NextResponse.json({ 
      message: "Servicio eliminado exitosamente" 
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener servicio específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const serviceId = params.id;
    const service = await Service.findById(serviceId)
      .populate("professionals", "firstName lastName professionalData.specialties");

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar servicio (solo Dra. Ana Felicidad)
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
        { error: "Solo la Dra. Ana Felicidad puede editar servicios" },
        { status: 403 }
      );
    }

    const serviceId = params.id;
    const updateData = await request.json();

    // Buscar y actualizar el servicio
    const service = await Service.findByIdAndUpdate(
      serviceId, 
      { 
        ...updateData,
        updatedAt: new Date(),
        updatedBy: decoded.id
      },
      { new: true }
    ).populate("professionals", "firstName lastName professionalData.specialties");

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Servicio actualizado exitosamente",
      service 
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 