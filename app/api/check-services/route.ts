import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Service from "@/models/service"

export async function GET() {
  try {
    console.log("Verificando conexión a MongoDB...")
    await connectToDatabase()

    console.log("Contando servicios...")
    const count = await Service.countDocuments()

    return NextResponse.json({
      message: `Hay ${count} servicios en la base de datos`,
      count: count,
      databaseConnected: true,
    })
  } catch (error) {
    console.error("Error al verificar servicios:", error)
    return NextResponse.json(
      {
        error: "Error al verificar servicios",
        details: error.message,
        databaseConnected: false,
      },
      { status: 500 },
    )
  }
}
