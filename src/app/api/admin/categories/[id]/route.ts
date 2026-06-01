import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import Category from "@/models/Category";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const doc = await Category.findById(id);
        if (!doc) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
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

        // Prevent self-parenting
        if (body.parent && body.parent === id) {
            return NextResponse.json({ message: "A category cannot be its own parent." }, { status: 400 });
        }

        // Resolve level based on parent
        if (body.parent) {
            const parentCat = await Category.findById(body.parent);
            if (parentCat) {
                body.level = parentCat.level + 1;
            } else {
                body.level = 0;
                body.parent = null;
            }
        } else {
            body.level = 0;
            body.parent = null;
        }

        const doc = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!doc) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
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

        // Check if there are any child categories under this category
        const children = await Category.findOne({ parent: id });
        if (children) {
            return NextResponse.json({ message: "Cannot delete this category because it has subcategories. Delete the subcategories first." }, { status: 400 });
        }

        const doc = await Category.findByIdAndDelete(id);
        if (!doc) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
