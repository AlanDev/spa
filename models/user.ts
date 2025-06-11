import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "cliente" | "professional" | "dra_ana_felicidad";
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  // Datos específicos para profesionales
  professionalData?: {
    specialties: string[];
    description?: string;
    experience?: number; // años de experiencia
    certification?: string;
    workingHours?: {
      start: string;
      end: string;
    };
    license?: string;
    services?: mongoose.Types.ObjectId[]; // servicios que puede realizar
    schedule?: {
      day: number; // 0=domingo, 1=lunes, etc.
      startTime: string; // "HH:MM"
      endTime: string; // "HH:MM"
      isAvailable: boolean;
    }[];
    bio?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["cliente", "professional", "dra_ana_felicidad"],
      default: "cliente",
    },
    phone: { type: String },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    professionalData: {
      specialties: [{ type: String }],
      description: { type: String },
      experience: { type: Number },
      certification: { type: String },
      workingHours: {
        start: { type: String },
        end: { type: String },
      },
      license: { type: String },
      services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
      schedule: [
        {
          day: { type: Number, min: 0, max: 6 },
          startTime: { type: String },
          endTime: { type: String },
          isAvailable: { type: Boolean, default: true },
        },
      ],
      bio: { type: String },
    },
  },
  { timestamps: true }
);

// Forzar la recreación del modelo si ya existe
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>("User", UserSchema); 