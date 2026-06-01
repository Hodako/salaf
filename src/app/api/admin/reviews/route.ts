import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Review } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (status === "approved") query.isApproved = true;
        if (status === "pending") query.isApproved = false;

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate("product", "name featuredImage")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(query)
        ]);

        return NextResponse.json({
            reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
