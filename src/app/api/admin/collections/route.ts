import { dbConnect } from '@/helpers/db';
import { NextResponse } from 'next/server';
import Collection from '@/models/Collection';

export async function GET() {
    try {
        await dbConnect();
        const collections = await Collection.find({}).sort({ name: 1 }).lean();
        return NextResponse.json(collections);
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
        const collection = await Collection.create(body);
        return NextResponse.json(collection, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A collection with this slug already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
