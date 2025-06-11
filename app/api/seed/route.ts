import { NextResponse } from "next/server"
import { seedServices } from "@/lib/seed-data"

export async function GET() {
  try {
    await seedServices()
    return NextResponse.json({ message: "Database seeded successfully!" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}
