import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET() {
  const obj = {
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
    city: "New York",
    country: "USA",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  logger.debug("API is running at " + new Date().toISOString(), obj);
  
  return NextResponse.json(obj);
}