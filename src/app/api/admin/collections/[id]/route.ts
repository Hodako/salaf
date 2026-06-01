import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import Model from "@/models/Collection";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const doc = await Model.findById(id);
        if (!doc) {
            return NextResponse.json({ message: "Collection not found" }, { status: 404 });
        }
        return NextResponse.json(doc);
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
        
        // Auto-slugify if name changed and slug not provided
        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const doc = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!doc) {
            return NextResponse.json({ message: "Collection not found" }, { status: 404 });
        }
        return NextResponse.json(doc);
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
        const doc = await Model.findByIdAndDelete(id);
        if (!doc) {
            return NextResponse.json({ message: "Collection not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Collection deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
