import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { verifyPassword } from "@/lib/auth";
import { generateTokenEdge } from "@/lib/auth-edge";

export async function POST(request: Request) {
  try {
    console.log("🚀 LOGIN: Starting login process...");
    const { email, password } = await request.json();
    console.log("📧 LOGIN: Email:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ LOGIN: User not found");
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!verifyPassword(password, user.password)) {
      console.log("❌ LOGIN: Invalid password");
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    console.log("✅ LOGIN: User authenticated successfully");

    // Generar token usando la función compatible con Edge Runtime
    const tokenData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      professionalData: user.professionalData,
    };
    
    console.log("🎫 LOGIN: Generating token for:", tokenData);
    const token = await generateTokenEdge(tokenData);
    console.log("🎫 LOGIN: Token generated:", token.substring(0, 50) + "...");

    // Crear respuesta con cookie
    const responseData = {
      message: "Login exitoso",
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        professionalData: user.professionalData,
      },
    };
    
    console.log("📦 LOGIN: Creating response with data:", responseData);
    const response = NextResponse.json(responseData);

    // Configurar cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    };
    
    console.log("🍪 LOGIN: Setting cookie with options:", cookieOptions);
    console.log("🌍 LOGIN: NODE_ENV:", process.env.NODE_ENV);
    console.log("🔒 LOGIN: Cookie will be secure:", cookieOptions.secure);
    
    response.cookies.set("spa-auth-token", token, cookieOptions);
    
    console.log("✅ LOGIN: Cookie set successfully");
    console.log("🎉 LOGIN: Login completed successfully");

    return response;
  } catch (error) {
    console.error("❌ LOGIN: Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 