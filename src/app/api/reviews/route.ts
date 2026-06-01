import { NextResponse } from "next/server";
import { dbConnect, getCurrentUser } from "@/helpers";
import { Review, Order, User } from "@/models";
import { verifyCaptcha } from "@/app/api/captcha/route";

export async function POST(req: Request) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { product, rating, comment, images, captchaToken, captchaAnswer } = body;

        if (!product || !rating) {
            return NextResponse.json({ error: "Product and rating are required" }, { status: 400 });
        }

        // 1. Verify Captcha
        if (!captchaToken || !captchaAnswer) {
            return NextResponse.json({ error: "Captcha is required" }, { status: 400 });
        }

        const isCaptchaValid = verifyCaptcha(captchaToken, captchaAnswer);
        if (!isCaptchaValid) {
            return NextResponse.json({ error: "Invalid or expired Captcha" }, { status: 400 });
        }

        await dbConnect();
        
        // 2. Find the DB user
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // 3. Prevent duplicate reviews for the same product by the same user
        const existingReview = await Review.findOne({ product, userId: dbUser._id });
        if (existingReview) {
            return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
        }

        // 4. Create the review
        const review = await Review.create({
            product,
            userId: dbUser._id,
            user: dbUser.name || "Anonymous Customer",
            rating,
            comment,
            images,
            isApproved: false // Set to false for manual approval
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create review" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("product");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        await dbConnect();
        const reviews = await Review.find({ product: productId, isApproved: true })
            .sort({ createdAt: -1 });
            
        return NextResponse.json(reviews);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
