import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import BusinessConfig from "@/models/business-config"

export async function GET() {
  try {
    await dbConnect()
    
    let config = await BusinessConfig.findOne({ isActive: true })
    
    // Si no existe configuración, crear una por defecto
    if (!config) {
      config = await BusinessConfig.create({
        name: "Spa Sentirse Bien",
        description: "Tu oasis de relajación y bienestar",
        contact: {
          phone: "(3624) 123456",
          whatsapp: "(3624) 123456",
          email: "info@spasentirsebien.com"
        },
        location: {
          address: "French 414",
          city: "Resistencia",
          province: "Chaco",
          details: [
            "Universidad Tecnológica Nacional",
            "Facultad Regional Resistencia",
            "Estacionamiento disponible"
          ]
        },
        businessHours: {
          monday: { open: "09:00", close: "19:00", isOpen: true },
          tuesday: { open: "09:00", close: "19:00", isOpen: true },
          wednesday: { open: "09:00", close: "19:00", isOpen: true },
          thursday: { open: "09:00", close: "19:00", isOpen: true },
          friday: { open: "09:00", close: "19:00", isOpen: true },
          saturday: { open: "09:00", close: "18:00", isOpen: true },
          sunday: { open: "10:00", close: "17:00", isOpen: true }
        },
        chatbotMessages: {
          welcome: "¡Hola! 👋 Bienvenido/a a Spa Sentirse Bien. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?",
          servicesIntro: "Ofrecemos una amplia gama de tratamientos de relajación y belleza. ¿Te interesa algún servicio en particular?",
          reservationInstructions: "Es muy fácil reservar tu cita:\n\n1️⃣ Regístrate en nuestra página\n2️⃣ Ve a la sección 'Servicios'\n3️⃣ Elige tu tratamiento favorito\n4️⃣ Selecciona fecha y hora\n5️⃣ ¡Confirma tu reserva!",
          contactInfo: "¡Estamos aquí para ayudarte! 💜",
          locationInfo: "¡Te esperamos en nuestro oasis de relajación!"
        },
        isActive: true
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching business config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración" }, 
      { status: 500 }
    )
  }
} 