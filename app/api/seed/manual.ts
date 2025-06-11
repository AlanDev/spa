import { seedServices } from "@/lib/seed-data"

// Esta función puede ser ejecutada desde cualquier parte de tu código
export async function manualSeed() {
  try {
    await seedServices()
    console.log("Servicios cargados exitosamente")
    return { success: true }
  } catch (error) {
    console.error("Error al cargar los servicios:", error)
    return { success: false, error }
  }
}
