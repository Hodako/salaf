import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { dbConnect } from "@/helpers";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const prefix = searchParams.get("prefix");

        if (!prefix) {
            return NextResponse.json({ error: "Prefix is required" }, { status: 400 });
        }

        const existing = await Product.findOne({ skuPrefix: prefix.toUpperCase() });
        return NextResponse.json({ available: !existing });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
