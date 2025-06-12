import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import connectToDatabase from "@/lib/mongodb"
import Service from "@/models/service"
import User from "@/models/user"

// GET - Obtener todos los servicios activos
export async function GET() {
  try {
    await connectToDatabase()
    
    const services = await Service.find({ isActive: true })
      .select('name category price duration')
      .sort({ category: 1, price: 1 })
    
    // Agrupar servicios por categoría
    const servicesByCategory = services.reduce((acc: any, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push({
        name: service.name,
        price: service.price,
        duration: service.duration
      })
      return acc
    }, {})
    
    return NextResponse.json(servicesByCategory)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Error al obtener servicios" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nuevo servicio (solo Dra. Ana Felicidad)
export async function POST(request: NextRequest) {
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

    await connectToDatabase()

    // Verificar que el usuario actual es Dra. Ana Felicidad
    const currentUser = await User.findById(decoded.id)
    if (!currentUser || currentUser.role !== "dra_ana_felicidad") {
      return NextResponse.json(
        { error: "Solo la Dra. Ana Felicidad puede crear servicios" },
        { status: 403 }
      )
    }

    const serviceData = await request.json()

    // Validar datos requeridos
    if (
      !serviceData.name ||
      !serviceData.description ||
      !serviceData.category ||
      !serviceData.price ||
      !serviceData.duration
    ) {
      return NextResponse.json(
        { error: "Datos incompletos para el servicio" },
        { status: 400 }
      )
    }

    // Crear servicio
    const service = new Service({
      ...serviceData,
      subcategory: serviceData.subcategory || serviceData.category,
      isActive: true,
      professionals: serviceData.professionals || [],
      availableTimeSlots: serviceData.availableTimeSlots || [
        "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
      ],
      availableDays: serviceData.availableDays || [1, 2, 3, 4, 5, 6],
    })

    await service.save()

    return NextResponse.json({
      message: "Servicio creado correctamente",
      service,
    })
  } catch (error) {
    console.error("Error creating service:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
