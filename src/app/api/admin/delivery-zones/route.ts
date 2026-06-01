import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { DeliveryZone } from "@/models";

export async function GET() {
    try {
        await dbConnect();
        const zones = await DeliveryZone.find().sort({ priority: -1 });
        return NextResponse.json(zones);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch delivery zones" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await dbConnect();
        const zone = await DeliveryZone.create(body);
        return NextResponse.json(zone, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create delivery zone" }, { status: 500 });
    }
}
