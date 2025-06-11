import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";

// GET - Obtener todos los profesionales
export async function GET(request: NextRequest) {
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

    // Obtener todos los profesionales
    const professionals = await User.find({
      role: { $in: ["professional", "dra_ana_felicidad"] }
    }).select("firstName lastName email role professionalData isActive createdAt");

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error("Error fetching professionals:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 