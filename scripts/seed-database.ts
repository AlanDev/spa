import mongoose from "mongoose"
import { config } from "dotenv"

// Cargar variables de entorno desde .env si existe
config()

// Definición del modelo de Servicio
interface IService {
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  duration: number
  image?: string
}

const ServiceSchema = new mongoose.Schema<IService>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true },
)

// Datos de servicios
const services = [
  // Masajes
  {
    name: "Masaje Anti-stress",
    description: "Masaje relajante para aliviar el estrés y la tensión muscular.",
    category: "individuales",
    subcategory: "masajes",
    price: 4500,
    duration: 60,
  },
  {
    name: "Masaje Descontracturante",
    description: "Masaje terapéutico para aliviar contracturas y dolores musculares.",
    category: "individuales",
    subcategory: "masajes",
    price: 5000,
    duration: 60,
  },
  {
    name: "Masaje con Piedras Calientes",
    description: "Masaje con piedras volcánicas calientes para relajar profundamente los músculos.",
    category: "individuales",
    subcategory: "masajes",
    price: 5500,
    duration: 75,
  },
  {
    name: "Masaje Circulatorio",
    description: "Masaje que mejora la circulación sanguínea y linfática.",
    category: "individuales",
    subcategory: "masajes",
    price: 4800,
    duration: 60,
  },

  // Belleza
  {
    name: "Lifting de Pestañas",
    description: "Tratamiento para levantar y curvar las pestañas naturales.",
    category: "individuales",
    subcategory: "belleza",
    price: 3500,
    duration: 45,
  },
  {
    name: "Depilación Facial",
    description: "Depilación de zonas faciales con cera o hilo.",
    category: "individuales",
    subcategory: "belleza",
    price: 2500,
    duration: 30,
  },
  {
    name: "Belleza de Manos",
    description: "Tratamiento completo para el cuidado y embellecimiento de las manos.",
    category: "individuales",
    subcategory: "belleza",
    price: 3000,
    duration: 45,
  },
  {
    name: "Belleza de Pies",
    description: "Tratamiento completo para el cuidado y embellecimiento de los pies.",
    category: "individuales",
    subcategory: "belleza",
    price: 3200,
    duration: 50,
  },

  // Tratamientos Faciales
  {
    name: "Punta de Diamante: Microexfoliación",
    description: "Tratamiento de microdermoabrasión con punta de diamante para renovar la piel.",
    category: "individuales",
    subcategory: "faciales",
    price: 4800,
    duration: 45,
  },
  {
    name: "Limpieza Profunda + Hidratación",
    description: "Limpieza facial profunda seguida de hidratación intensiva.",
    category: "individuales",
    subcategory: "faciales",
    price: 5200,
    duration: 60,
  },
  {
    name: "Crio Frecuencia Facial",
    description: 'Tratamiento que produce "SHOCK TÉRMICO" logrando resultados instantáneos de efecto lifting.',
    category: "individuales",
    subcategory: "faciales",
    price: 6000,
    duration: 60,
  },

  // Tratamientos Corporales
  {
    name: "VelaSlim",
    description: "Tratamiento para reducción de la circunferencia corporal y la celulitis.",
    category: "individuales",
    subcategory: "corporales",
    price: 6500,
    duration: 60,
  },
  {
    name: "DermoHealth",
    description:
      "Tratamiento que moviliza los distintos tejidos de la piel y estimula la microcirculación, generando un drenaje linfático.",
    category: "individuales",
    subcategory: "corporales",
    price: 6000,
    duration: 60,
  },
  {
    name: "Criofrecuencia Corporal",
    description: "Tratamiento que produce un efecto de lifting instantáneo en el cuerpo.",
    category: "individuales",
    subcategory: "corporales",
    price: 6800,
    duration: 75,
  },
  {
    name: "Ultracavitación",
    description: "Técnica reductora que utiliza ultrasonidos para eliminar la grasa localizada.",
    category: "individuales",
    subcategory: "corporales",
    price: 7000,
    duration: 60,
  },

  // Servicios Grupales
  {
    name: "Hidromasajes",
    description: "Sesión de hidromasaje en jacuzzi para grupos de hasta 4 personas.",
    category: "grupales",
    subcategory: "hidromasajes",
    price: 8000,
    duration: 60,
  },
  {
    name: "Yoga",
    description: "Clase de yoga para grupos de hasta 10 personas.",
    category: "grupales",
    subcategory: "yoga",
    price: 2500,
    duration: 90,
  },
]

async function seedDatabase() {
  try {
    // Obtener la URI de MongoDB desde las variables de entorno
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
      throw new Error("La variable de entorno MONGODB_URI no está definida")
    }

    console.log("Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Conexión exitosa a MongoDB")

    // Registrar el modelo de Servicio
    const Service = mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema)

    // Verificar si ya existen servicios
    const count = await Service.countDocuments()

    if (count > 0) {
      console.log(`Ya existen ${count} servicios en la base de datos.`)

      // Preguntar si desea borrar y recargar
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      readline.question("¿Desea borrar los servicios existentes y cargar nuevos? (s/n): ", async (answer: string) => {
        if (answer.toLowerCase() === "s") {
          console.log("Borrando servicios existentes...")
          await Service.deleteMany({})
          await insertServices(Service)
        } else {
          console.log("Operación cancelada. No se han realizado cambios.")
        }
        readline.close()
        await mongoose.disconnect()
      })
    } else {
      // No hay servicios, insertar directamente
      await insertServices(Service)
      await mongoose.disconnect()
    }
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

async function insertServices(Service: mongoose.Model<IService>) {
  console.log("Insertando servicios...")

  try {
    const result = await Service.insertMany(services)
    console.log(`¡${result.length} servicios insertados exitosamente!`)
  } catch (error) {
    console.error("Error al insertar servicios:", error)
  }
}

// Ejecutar el script
seedDatabase()
