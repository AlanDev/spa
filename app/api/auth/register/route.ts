import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    console.log("🚀 Iniciando proceso de registro...");
    
    const { email, password, firstName, lastName, accountType } = await request.json();
    console.log("📧 Datos recibidos:", { email, firstName, lastName, accountType });

    if (!email || !password || !firstName || !lastName) {
      console.log("❌ Campos faltantes");
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log("❌ Contraseña muy corta");
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    console.log("🔗 Conectando a la base de datos...");
    await connectToDatabase();
    console.log("✅ Conexión establecida");

    // Verificar si el email ya existe
    console.log("🔍 Verificando si el email existe...");
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ Email ya existe");
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si es el primer usuario para hacerlo administrador
    console.log("👑 Verificando si es el primer usuario...");
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    console.log(`📊 Total de usuarios: ${userCount}, ¿Es primer usuario?: ${isFirstUser}`);

    // Hash de la contraseña
    console.log("🔐 Hasheando contraseña...");
    const hashedPassword = hashPassword(password);
    console.log("✅ Contraseña hasheada");

    // Determinar el rol del usuario
    let userRole: "cliente" | "professional" | "dra_ana_felicidad" = "cliente";
    if (isFirstUser) {
      userRole = "dra_ana_felicidad";
    } else if (accountType === "professional") {
      userRole = "professional";
    }

    // Crear usuario
    console.log("👤 Creando objeto usuario...");
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: userRole,
      isActive: true,
      ...(isFirstUser && {
        professionalData: {
          specialties: ['Administración', 'Gestión de Spa', 'Todos los Tratamientos'],
          license: 'ADM-001',
          experience: 15,
          services: [],
          schedule: [
            { day: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
          ],
          bio: 'Directora del Spa Sentirse Bien con acceso completo al sistema.',
        }
      })
    };

    console.log("💾 Guardando usuario en base de datos...");
    const user = new User(userData);
    await user.save();
    console.log(`✅ Usuario guardado exitosamente como ${userRole}`);

    // Generar token
    console.log("🎫 Generando token...");
    const token = generateToken({
      id: (user._id as string).toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      professionalData: user.professionalData,
    });
    console.log("✅ Token generado");

    // Crear respuesta con cookie
    console.log("🍪 Configurando cookie...");
    const response = NextResponse.json({
      message: `${
        isFirstUser ? 'Administrador' : 
        userRole === 'professional' ? 'Profesional' : 
        'Usuario'
      } registrado exitosamente`,
      user: {
        id: (user._id as string).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        professionalData: user.professionalData,
      },
    });

    // Configurar cookie
    response.cookies.set("spa-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    console.log("🎉 Registro completado exitosamente");
    return response;
  } catch (err: any) {
    console.error("❌ Error en registro:", err);
    console.error("📋 Stack trace:", err?.stack || String(err));
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 