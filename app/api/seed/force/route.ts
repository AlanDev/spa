import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import Service from "@/models/service";
import Booking from "@/models/booking";

export async function POST(request: NextRequest) {
  try {
    const { seedToken } = await request.json();
    
    if (process.env.NODE_ENV === "production" && seedToken !== process.env.SEED_TOKEN) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Limpiar todas las colecciones
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({})
    ]);

    // Crear contraseñas hasheadas
    const adminPassword = bcrypt.hashSync("123456", 12);
    const professionalPassword = bcrypt.hashSync("123456", 12);
    const clientPassword = bcrypt.hashSync("123456", 12);

    // Crear usuarios iniciales
    const users = [
      {
        email: "ana@spa.com",
        password: adminPassword,
        firstName: "Ana",
        lastName: "Felicidad",
        role: "dra_ana_felicidad",
        phone: "+54 11 1234-5678",
        isActive: true,
      },
      {
        email: "maria@spa.com",
        password: professionalPassword,
        firstName: "María",
        lastName: "García",
        role: "professional",
        phone: "+54 11 2345-6789",
        isActive: true,
      },
      {
        email: "carlos@spa.com",
        password: professionalPassword,
        firstName: "Carlos",
        lastName: "Rodríguez",
        role: "professional",
        phone: "+54 11 3456-7890",
        isActive: true,
      },
      {
        email: "cliente@test.com",
        password: clientPassword,
        firstName: "Cliente",
        lastName: "Test",
        role: "cliente",
        phone: "+54 11 5678-9012",
        isActive: true,
      }
    ];

    const createdUsers = await User.insertMany(users);

    // Crear servicios básicos
    const services = [
      {
        name: "Masaje Relajante",
        description: "Masaje anti-stress para aliviar tensiones",
        category: "Masajes",
        subcategory: "Relajación",
        price: 8500,
        duration: 60,
        isActive: true,
      },
      {
        name: "Tratamiento Facial",
        description: "Limpieza profunda y hidratación facial",
        category: "Faciales",
        subcategory: "Limpieza",
        price: 7000,
        duration: 45,
        isActive: true,
      },
      {
        name: "VelaSlim",
        description: "Tratamiento de reducción localizada",
        category: "Corporales",
        subcategory: "Modelado",
        price: 12000,
        duration: 90,
        isActive: true,
      },
      {
        name: "Masaje Descontracturante",
        description: "Masaje terapéutico profundo",
        category: "Masajes",
        subcategory: "Terapéutico",
        price: 9500,
        duration: 90,
        isActive: true,
      },
      {
        name: "Limpieza de Cutis Profunda",
        description: "Limpieza facial completa con extracciones",
        category: "Faciales",
        subcategory: "Limpieza",
        price: 8000,
        duration: 60,
        isActive: true,
      }
    ];

    const createdServices = await Service.insertMany(services);

    return NextResponse.json({
      success: true,
      message: "Base de datos reinicializada exitosamente",
      cleared: {
        users: true,
        services: true,
        bookings: true
      },
      created: {
        users: createdUsers.length,
        services: createdServices.length
      },
      accounts: [
        { email: "ana@spa.com", password: "123456", role: "admin" },
        { email: "maria@spa.com", password: "123456", role: "professional" },
        { email: "carlos@spa.com", password: "123456", role: "professional" },
        { email: "cliente@test.com", password: "123456", role: "cliente" }
      ]
    });

  } catch (error) {
    console.error("Error force seeding database:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 