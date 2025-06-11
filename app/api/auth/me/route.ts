import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import connectToDatabase from "@/lib/mongodb";
import User, { type IUser } from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 /api/auth/me - Checking authentication...");
    
    const token = request.cookies.get("spa-auth-token")?.value;
    console.log("🎫 /api/auth/me - Token found:", token ? "YES" : "NO");

    if (!token) {
      console.log("❌ /api/auth/me - No token, returning 401");
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenEdge(token);
    console.log("✅ /api/auth/me - Token decoded:", decoded ? "YES" : "NO");
    console.log("👤 /api/auth/me - User data:", decoded);
    
    if (!decoded) {
      console.log("❌ /api/auth/me - Invalid token, returning 401");
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Obtener datos actualizados del usuario
    const user: IUser | null = await User.findById(decoded.id);
    console.log("👤 /api/auth/me - User from DB:", user ? "FOUND" : "NOT FOUND");
    
    if (!user) {
      console.log("❌ /api/auth/me - User not found in DB, returning 404");
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const responseData = {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        professionalData: user.professionalData,
      },
    };
    
    console.log("✅ /api/auth/me - Returning user data:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ /api/auth/me - Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 