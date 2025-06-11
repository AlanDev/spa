import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Función para determinar el rol basado en el email - VERSIÓN FLEXIBLE
function determineUserRole(email: string): "cliente" | "profesional" | "dra_ana_felicidad" {
  const emailLower = email.toLowerCase();
  
  // Dra. Ana Felicidad - Cualquier email que contenga estas palabras
  if (
    emailLower.includes('admin') || 
    emailLower.includes('ana') || 
    emailLower.includes('director') || 
    emailLower.includes('jefe') ||
    emailLower.includes('gerente') ||
    emailLower.includes('manager') ||
    emailLower.includes('boss') ||
    emailLower.includes('spa')
  ) {
    return "dra_ana_felicidad";
  }
  
  // Profesionales - Cualquier email que contenga estas palabras
  if (
    emailLower.includes('maria') ||
    emailLower.includes('carlos') ||
    emailLower.includes('lucia') ||
    emailLower.includes('masaje') ||
    emailLower.includes('belleza') ||
    emailLower.includes('facial') ||
    emailLower.includes('yoga') ||
    emailLower.includes('profesional') ||
    emailLower.includes('staff') ||
    emailLower.includes('employee') ||
    emailLower.includes('pro') ||
    emailLower.includes('trabajo') ||
    emailLower.includes('work')
  ) {
    return "profesional";
  }
  
  // Por defecto, cliente (cualquier email normal)
  return "cliente";
}

// Función para obtener datos profesionales basados en el email
function getProfessionalData(email: string, role: string) {
  const emailLower = email.toLowerCase();
  
  if (role !== "profesional" && role !== "dra_ana_felicidad") {
    return undefined;
  }
  
  // Dra. Ana Felicidad
  if (role === "dra_ana_felicidad") {
    return {
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
      bio: 'Administrador del sistema con acceso completo a todas las funciones del spa.',
    };
  }
  
  // Detectar especialidad por palabras en el email
  if (emailLower.includes('maria') || emailLower.includes('masaje')) {
    return {
      specialties: ['Masajes', 'Relajación', 'Tratamientos Corporales'],
      license: 'PROF-001',
      experience: 8,
      services: [],
      schedule: [
        { day: 1, startTime: '10:00', endTime: '19:00', isAvailable: true },
        { day: 2, startTime: '10:00', endTime: '19:00', isAvailable: true },
        { day: 3, startTime: '10:00', endTime: '19:00', isAvailable: true },
        { day: 4, startTime: '10:00', endTime: '19:00', isAvailable: true },
        { day: 5, startTime: '10:00', endTime: '19:00', isAvailable: true },
        { day: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
      ],
      bio: 'Especialista en masajes terapéuticos y técnicas de relajación.',
    };
  }
  
  if (emailLower.includes('carlos') || emailLower.includes('belleza') || emailLower.includes('facial')) {
    return {
      specialties: ['Tratamientos Faciales', 'Cuidado de la Piel', 'Belleza'],
      license: 'PROF-002',
      experience: 5,
      services: [],
      schedule: [
        { day: 2, startTime: '11:00', endTime: '20:00', isAvailable: true },
        { day: 3, startTime: '11:00', endTime: '20:00', isAvailable: true },
        { day: 4, startTime: '11:00', endTime: '20:00', isAvailable: true },
        { day: 5, startTime: '11:00', endTime: '20:00', isAvailable: true },
        { day: 6, startTime: '10:00', endTime: '16:00', isAvailable: true },
      ],
      bio: 'Experto en tratamientos faciales y cuidado personalizado de la piel.',
    };
  }
  
  if (emailLower.includes('lucia') || emailLower.includes('yoga') || emailLower.includes('grupal')) {
    return {
      specialties: ['Servicios Grupales', 'Yoga', 'Hidromasajes'],
      license: 'PROF-003',
      experience: 6,
      services: [],
      schedule: [
        { day: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 6, startTime: '08:00', endTime: '14:00', isAvailable: true },
        { day: 0, startTime: '10:00', endTime: '16:00', isAvailable: true },
      ],
      bio: 'Instructor de yoga certificado y especialista en terapias grupales.',
    };
  }
  
  // Profesional genérico (cualquier otro profesional)
  return {
    specialties: ['Tratamientos Generales', 'Bienestar'],
    license: `PROF-${Date.now()}`,
    experience: 3,
    services: [],
    schedule: [
      { day: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
    ],
    bio: 'Profesional del spa especializado en bienestar y relajación.',
  };
}

// GET - Obtener datos del usuario actual
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
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar datos del usuario
export async function PUT(request: NextRequest) {
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
    
    const body = await request.json();
    
    await connectToDatabase();
    
    const user = await User.findByIdAndUpdate(decoded.id, body, { new: true });
    
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 