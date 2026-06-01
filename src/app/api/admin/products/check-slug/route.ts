import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { dbConnect } from "@/helpers";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const existing = await Product.findOne({ slug });
        return NextResponse.json({ available: !existing });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
