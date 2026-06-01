import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Order, User } from "@/models";
import { getCurrentUser } from "@/helpers";

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
        
        // Find the user first
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Find the order and ensure it belongs to this user
        const order = await Order.findOne({ 
            _id: id,
            user: dbUser._id 
        }).populate('user');

        if (!order) {
            return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
    }
}
