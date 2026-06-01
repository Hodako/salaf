import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers/db';
import Tag from '@/models/Tag';

export async function GET() {
    try {
        await dbConnect();
        const tags = await Tag.find({}).sort({ name: 1 }).lean();
        return NextResponse.json(tags);
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
        const tag = await Tag.create(body);
        return NextResponse.json(tag, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A tag with this name/slug already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
