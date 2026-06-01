import { NextResponse } from "next/server";
import { getCurrentUser, dbConnect } from "@/helpers";
import { User, Order } from "@/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await User.findOne({ firebaseUid: authUser.uid });
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const user = await User.findById(id);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (user.role === 'admin') {
            return NextResponse.json({ user });
        }

        // Stats for customers
        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const successRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

        return NextResponse.json({
            user,
            stats: {
                totalOrders,
                totalSpent,
                successRate: Math.round(successRate),
                deliveredOrders
            },
            recentOrders: orders.slice(0, 10)
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await User.findOne({ firebaseUid: authUser.uid });
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const { role } = await req.json();

        // Prevent self-demotion
        if (id === admin._id.toString()) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
