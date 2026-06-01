import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Order, User, Coupon } from "@/models";
import { getCurrentUser } from "@/helpers";
import { normalizePhoneNumber } from "@/helpers";

export async function POST(req: Request) {
    try {
        const authUser = await getCurrentUser();
        const body = await req.json();
        const { 
            items, 
            shippingAddress, 
            phoneNumber, 
            subtotal, 
            shippingFee, 
            totalAmount, 
            couponCode, 
            discountAmount,
            email,
            name 
        } = body;

        await dbConnect();

        // 1. Find and update (or create) the User profile
        let userQuery: any = {};
        if (authUser?.uid) {
            userQuery = { firebaseUid: authUser.uid };
        } else if (email) {
            userQuery = { email: email.toLowerCase() };
        } else {
            return NextResponse.json({ error: "Email is required for guest checkout" }, { status: 400 });
        }

        const dbUser = await User.findOneAndUpdate(
            userQuery,
            { 
                name: name || "Customer",
                email: email?.toLowerCase() || (userQuery.email),
                phoneNumber: normalizePhoneNumber(phoneNumber), 
                address: shippingAddress,
                $setOnInsert: { 
                    role: 'customer' 
                }
            },
            { new: true, upsert: true }
        );

        // 2. Clear purchased items from wishlist
        await User.findByIdAndUpdate(dbUser._id, {
            $pull: { wishlist: { $in: items.map((i: any) => i.product) } }
        });

        // 3. Create the order
        const order = await Order.create({
            user: dbUser._id,
            items,
            shippingAddress,
            phoneNumber: normalizePhoneNumber(phoneNumber),
            subtotal,
            shippingFee,
            totalAmount,
            couponCode: couponCode?.toUpperCase(),
            discountAmount: discountAmount || 0,
            status: 'Pending',
            paymentStatus: 'Unpaid'
        });

        // 4. Increment coupon usage
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        // 5. Send Telegram Notification
        try {
            const Settings = (await import("@/models/Settings")).default;
            const { sendTelegramMessage } = await import("@/lib/telegram");

            const botTokenSetting = await Settings.findOne({ key: "telegramBotToken" });
            const chatIdSetting = await Settings.findOne({ key: "telegramChatId" });

            console.log(`📡 [Orders API] Notification Trigger: Token Found? ${!!botTokenSetting?.value}, ChatID Found? ${!!chatIdSetting?.value}`);

            if (botTokenSetting?.value && chatIdSetting?.value) {
                const productList = items.map((i: any) => `- ${i.productName} ${i.variantType ? `(${i.variantType})` : ""} (x${i.quantity})`).join("\n");
                const adminOrderLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order._id}`;
                
                const message = `✨ *New Order Placed!*
                
👤 *Customer:* ${dbUser.name}
📱 *Phone:* ${order.phoneNumber}
💰 *Total:* ৳${order.totalAmount.toLocaleString()}

📦 *Products:*
${productList}

🔗 [View in Admin Panel](${adminOrderLink})`;

                await sendTelegramMessage(botTokenSetting.value as string, chatIdSetting.value as string, message);
            }
        } catch (tgError: any) {
            console.error(`❌ [Orders API] Notification execution failed for Order ${order._id}:`, tgError.message);
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const orders = await Order.find({ user: dbUser._id }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
