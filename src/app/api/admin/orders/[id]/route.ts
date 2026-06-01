import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Order } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Skip DB admin role check in dev mode
        const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true';
        if (!isDev) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
                    if (!dbUser || dbUser.role !== 'admin') {
                        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                    }
        }

        const order = await Order.findById(id).populate("user").populate("items.product");
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, paymentStatus } = body;

        await dbConnect();
        // Skip DB admin role check in dev mode
        const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true';
        if (!isDev) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
                    if (!dbUser || dbUser.role !== 'admin') {
                        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                    }
        }

        const updateData: any = { status, paymentStatus };
        if (status === "Cancelled" && !paymentStatus) {
            updateData.paymentStatus = "Unpaid";
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
