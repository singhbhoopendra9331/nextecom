import { getAllOptions } from "@/lib/options";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    try {
        const limit = Number(searchParams.get("limit") || 20)
        const page = Number(searchParams.get("page") || 1)
        const q = searchParams.get("q") || ""
        const skip = (page - 1) * limit

        const options = await getAllOptions();

        return NextResponse.json({ docs: options, limit, page, q, skip })
    } catch (error) {
        console.error("GET /api/options:", error)
        return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
    }
}