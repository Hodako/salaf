import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Product } from '@/models';

export async function GET() {
    try {
        await dbConnect();
        console.time("[DB Telemetry] Admin Fetch Products");
        const products = await Product.find({})
            .populate('brand')
            .populate('category')
            .populate('subcategory')
            .sort({ createdAt: -1 });
        console.timeEnd("[DB Telemetry] Admin Fetch Products");
        return NextResponse.json(products, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
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

        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to create product" }, { status: 500 });
    }
}
