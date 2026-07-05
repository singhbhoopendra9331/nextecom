import { getApplicationStats } from "@/lib/dashboard-stats";
import { requireApiSession } from "@/lib/auth/require-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  const auth = await requireApiSession();
  if (auth.response) {
    return auth.response;
  }

  const stats = await getApplicationStats();
  return NextResponse.json(stats);
};