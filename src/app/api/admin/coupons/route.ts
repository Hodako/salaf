import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Coupon } from '@/models';
import { isAdmin } from '@/helpers/server-auth';

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json(coupons, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        
        // Basic validation: code must be unique
        const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existing) {
            return NextResponse.json({ message: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await Coupon.create(body);
        return NextResponse.json(coupon, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to create coupon" }, { status: 500 });
    }
}
