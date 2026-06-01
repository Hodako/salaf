import { NextResponse } from "next/server";
import { dbConnect, getCurrentUser } from "@/helpers";
import { Review, User } from "@/models";

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

        const reviews = await Review.find({ userId: dbUser._id })
            .populate('product', 'name featuredImage')
            .sort({ createdAt: -1 });
            
        return NextResponse.json(reviews);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch your reviews" }, { status: 500 });
    }
}
