import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Coupon } from '@/models';
import { isAdmin } from '@/helpers/server-auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!(await isAdmin())) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
        if (!coupon) return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        return NextResponse.json(coupon, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to update coupon" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!(await isAdmin())) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        return NextResponse.json({ message: "Coupon deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 });
    }
}
