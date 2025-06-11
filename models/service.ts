import mongoose, { Schema, type Document } from "mongoose"

export interface IService extends Document {
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  duration: number
  image?: string
  // Profesionales que pueden realizar este servicio
  professionals: mongoose.Types.ObjectId[]
  isActive: boolean
  // Configuración de horarios disponibles
  availableTimeSlots: string[] // ["09:00", "10:00", "11:00", etc.]
  // Días de la semana disponibles (0=domingo, 1=lunes, etc.)
  availableDays: number[]
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    image: { type: String },
    professionals: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    availableTimeSlots: [{ type: String }],
    availableDays: [{ type: Number, min: 0, max: 6 }],
  },
  { timestamps: true },
)

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema)
