import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// GET - Obtener lista de profesionales
export async function GET(request: NextRequest) {
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
    
    await connectToDatabase();

    // Buscar usuarios con rol "professional"
    const professionals = await User.find({
      role: "professional",
      isActive: true,
    }).select("firstName lastName email professionalData");

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error("Error fetching professionals:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Registrar nuevo profesional (solo Dra. Ana Felicidad puede hacer esto)
export async function POST(request: Request) {
  try {
    const authResult = await auth();
    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Verificar que el usuario actual es Dra. Ana Felicidad
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Solo la Dra. Ana Felicidad puede registrar profesionales" },
        { status: 403 }
      );
    }

    const professionalData = await request.json();

    // Validar datos requeridos
    if (
      !professionalData.email ||
      !professionalData.firstName ||
      !professionalData.lastName ||
      !professionalData.professionalData?.license
    ) {
      return NextResponse.json(
        { error: "Datos incompletos para el registro del profesional" },
        { status: 400 }
      );
    }

    // Crear profesional
    const professional = new User({
      ...professionalData,
      role: "profesional",
      isActive: true,
      clerkId: `temp_${Date.now()}`, // Temporal hasta que se registre en Clerk
    });

    await professional.save();

    return NextResponse.json({
      message: "Profesional registrado correctamente",
      professional,
    });
  } catch (error) {
    console.error("Error creating professional:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 