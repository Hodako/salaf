import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Brand } from "@/models";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const brand = await Brand.findById(id);
        if (!brand) {
            return NextResponse.json({ message: "Brand not found" }, { status: 404 });
        }
        return NextResponse.json(brand);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await req.json();
        
        // Ensure slug is updated if name is changed and slug not provided
        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const brand = await Brand.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!brand) {
            return NextResponse.json({ message: "Brand not found" }, { status: 404 });
        }
        return NextResponse.json(brand);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) {
            return NextResponse.json({ message: "Brand not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Brand deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
