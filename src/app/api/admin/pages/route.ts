import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Page } from '@/models';

export async function GET() {
    try {
        await dbConnect();
        // Fetch pages but exclude heavy HTML/CSS strings for the list view
        const pages = await Page.find({}).select('-html -css -sections').sort({ createdAt: -1 });
        return NextResponse.json(pages, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch pages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Ensure slug is generated if not provided
        if (!body.slug && body.title) {
            body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const page = await Page.create(body);
        return NextResponse.json(page, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: "A page with this slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ message: error.message || "Failed to create page" }, { status: 500 });
    }
}
