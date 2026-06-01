import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { DeliveryZone } from "@/models";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const zone = await DeliveryZone.findById(id);
        if (!zone) return NextResponse.json({ error: "Zone not found" }, { status: 404 });
        return NextResponse.json(zone);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch delivery zone" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        await dbConnect();
        const zone = await DeliveryZone.findByIdAndUpdate(id, body, { new: true });
        if (!zone) return NextResponse.json({ error: "Zone not found" }, { status: 404 });
        return NextResponse.json(zone);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update delivery zone" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const zone = await DeliveryZone.findByIdAndDelete(id);
        if (!zone) return NextResponse.json({ error: "Zone not found" }, { status: 404 });
        return NextResponse.json({ message: "Zone deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete delivery zone" }, { status: 500 });
    }
}
