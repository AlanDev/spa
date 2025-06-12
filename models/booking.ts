import mongoose, { Schema, type Document } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  userName: string;
  professionalId?: mongoose.Types.ObjectId;
  professionalName?: string;
  // Servicios (puede ser múltiple)
  services: {
    serviceId: mongoose.Types.ObjectId;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceCategory: string;
    serviceSubcategory: string;
  }[];
  date: Date;
  timeSlot: string; // Hora de la reserva en formato "HH:MM"
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  originalDate?: Date;
  // Información de pago
  payment: {
    amount: number;
    originalAmount: number; // precio sin descuento
    discount: number; // porcentaje de descuento aplicado
    paid: boolean;
    paidAt?: Date;
    transactionId?: string;
    receiptSent: boolean; // comprobante enviado por email
  };
  // Notas adicionales
  notes?: string;
  // Notas del tratamiento realizado (nuevo campo)
  treatmentNotes?: {
    notes: string;
    addedAt: Date;
    addedBy: mongoose.Types.ObjectId; // ID del profesional que agregó las notas
    addedByName: string; // Nombre del profesional
  };
  // Restricciones de reserva
  reservedAt: Date; // cuándo se hizo la reserva
  canModify: boolean; // si puede modificarse (48hs antes)
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    professionalId: { type: Schema.Types.ObjectId, ref: "User" },
    professionalName: { type: String },
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
        serviceName: { type: String, required: true },
        servicePrice: { type: Number, required: true },
        serviceDuration: { type: Number, required: true },
        serviceCategory: { type: String, required: true },
        serviceSubcategory: { type: String, required: true },
      },
    ],
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "rescheduled", "completed"],
      default: "confirmed",
    },
    originalDate: { type: Date },
    payment: {
      amount: { type: Number, required: true },
      originalAmount: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paidAt: { type: Date },
      transactionId: { type: String },
      receiptSent: { type: Boolean, default: false },
    },
    notes: { type: String },
    treatmentNotes: {
      notes: { type: String },
      addedAt: { type: Date },
      addedBy: { type: Schema.Types.ObjectId, ref: "User" },
      addedByName: { type: String },
    },
    reservedAt: { type: Date, default: Date.now },
    canModify: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
