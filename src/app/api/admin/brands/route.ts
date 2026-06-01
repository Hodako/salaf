import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Brand } from '@/models';

export async function GET() {
    try {
        await dbConnect();
        const brands = await Brand.find({}).sort({ name: 1 });
        return NextResponse.json(brands, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch brands" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Ensure slug is generated if not provided
        if (!body.slug && body.name) {
            body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const brand = await Brand.create(body);
        return NextResponse.json(brand, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to create brand" }, { status: 500 });
    }
}
