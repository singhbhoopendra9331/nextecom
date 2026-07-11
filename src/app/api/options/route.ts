import { getAllOptions } from "@/lib/options";
import { requireApiPermission } from "@/lib/auth/require-auth";
import { parsePaginationParams } from "@/lib/pagination";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const auth = await requireApiPermission("settings:manage");
    if (auth.response) {
        return auth.response;
    }

    const { searchParams } = new URL(req.url)
    try {
        const { page, limit, skip } = parsePaginationParams(
            searchParams.get("page"),
            searchParams.get("limit")
        )
        const q = searchParams.get("q") || ""

        const options = await getAllOptions();

        return NextResponse.json({ docs: options, limit, page, q, skip })
    } catch (error) {
        console.error("GET /api/options:", error)
        return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
    }
}