import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Coupon, Order, User } from '@/models';
import { getCurrentUser } from '@/helpers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ message: "Coupon code is required" }, { status: 400 });
        }

        await dbConnect();
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return NextResponse.json({ message: "Invalid or inactive coupon code" }, { status: 404 });
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return NextResponse.json({ message: "Coupon has expired or is not yet valid" }, { status: 400 });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ message: "Coupon usage limit reached" }, { status: 400 });
        }

        if (coupon.minimumPurchaseAmount && cartTotal < coupon.minimumPurchaseAmount) {
            return NextResponse.json({ 
                message: `Minimum purchase of ৳ ${coupon.minimumPurchaseAmount} required for this coupon` 
            }, { status: 400 });
        }

        // Check per-user limit
        const authUser = await getCurrentUser();
        if (authUser && coupon.maxUsesPerUser) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
            if (dbUser) {
                const userUsageCount = await Order.countDocuments({ 
                    user: dbUser._id, 
                    couponCode: coupon.code 
                });
                
                if (userUsageCount >= coupon.maxUsesPerUser) {
                    return NextResponse.json({ 
                        message: `You have already used this coupon the maximum allowed times (${coupon.maxUsesPerUser})` 
                    }, { status: 400 });
                }
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'fixed_amount') {
            discountAmount = coupon.discountValue;
        } else {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }

        // Ensure discount doesn't exceed cart total
        discountAmount = Math.min(discountAmount, cartTotal);

        return NextResponse.json({ 
            valid: true, 
            discountAmount, 
            couponCode: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Failed to validate coupon" }, { status: 500 });
    }
}
