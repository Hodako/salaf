import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Product, User, Order } from '@/models';
import { getCurrentUser } from '@/helpers';

export async function GET() {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Ensure user is admin — skip DB check in dev mode
        const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true';
        if (!isDev) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
            if (!dbUser || dbUser.role !== 'admin') {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        
        // Calculate real revenue from Paid Orders only
        const ordersData = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $subtract: ["$totalAmount", "$shippingFee"] } },
                }
            }
        ]);

        const totalRevenue = ordersData[0]?.totalRevenue || 0;
        const totalOrders = await Order.countDocuments(); // All checkouts
        const pendingOrders = await Order.countDocuments({ status: "Pending" });
        const processingOrders = await Order.countDocuments({ status: "Processing" });

        // Optimized Recent Transactions with product slugs and essential fields
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email")
            .populate("items.product", "slug"); // For linking to product details

        const recentTransactions = recentOrders.map(order => ({
            _id: order._id,
            status: order.status,
            createdAt: order.createdAt,
            user: order.user,
            // Calculate product revenue for this order (total-shipping)
            productRevenue: order.totalAmount - order.shippingFee,
            items: order.items.map((item: any) => ({
                productName: item.productName,
                slug: item.product?.slug, // From populated product
                quantity: item.quantity
            }))
        }));

        return NextResponse.json({
            productCount,
            userCount,
            totalRevenue,
            totalOrders,
            pendingOrders,
            processingOrders,
            recentTransactions
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
