import { getApplicationStats } from "@/lib/dashboard-stats";
import { NextResponse } from "next/server";

export const GET = async () => {
  const stats = await getApplicationStats();
  return NextResponse.json(stats);
};