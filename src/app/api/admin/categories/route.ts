import { dbConnect } from '@/helpers/db';
import { NextResponse } from 'next/server';
import Category from '@/models/Category';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ level: 1, name: 1 }).lean();
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Auto-slugify if not provided
        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        await dbConnect();

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

        const category = await Category.create(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
