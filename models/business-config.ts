import mongoose, { Schema, type Document } from "mongoose"

export interface IBusinessConfig extends Document {
  name: string
  description: string
  contact: {
    phone: string
    whatsapp: string
    email: string
  }
  location: {
    address: string
    city: string
    province: string
    details: string[]
  }
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  chatbotMessages: {
    welcome: string
    servicesIntro: string
    reservationInstructions: string
    contactInfo: string
    locationInfo: string
  }
  isActive: boolean
}

const BusinessConfigSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    contact: {
      phone: { type: String, required: true },
      whatsapp: { type: String, required: true },
      email: { type: String, required: true },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      details: [{ type: String }],
    },
    businessHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
    chatbotMessages: {
      welcome: { type: String, required: true },
      servicesIntro: { type: String, required: true },
      reservationInstructions: { type: String, required: true },
      contactInfo: { type: String, required: true },
      locationInfo: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.BusinessConfig || mongoose.model<IBusinessConfig>("BusinessConfig", BusinessConfigSchema) 