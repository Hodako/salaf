import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Order } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function GET() {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Ensure user is admin
        // Skip DB admin role check in dev mode
        const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true';
        if (!isDev) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
                    if (!dbUser || dbUser.role !== 'admin') {
                        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
                    }
        }

        const orders = await Order.find({})
            .populate("user", "name email phoneNumber address")
            .sort({ createdAt: -1 });

        const ordersWithRevenue = orders.map(order => ({
            ...order.toObject(),
            productRevenue: (order.subtotal || 0) - (order.discountAmount || 0)
        }));

        return NextResponse.json(ordersWithRevenue);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
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
                return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
            }
        }

        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid or missing order IDs" }, { status: 400 });
        }

        const result = await Order.deleteMany({ _id: { $in: ids } });
        return NextResponse.json({ 
            message: `${result.deletedCount} orders deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete orders" }, { status: 500 });
    }
}
