import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { ExternalReview } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function GET(req: Request) {
 try {
 const { searchParams } = new URL(req.url);
 const page = parseInt(searchParams.get("page") || "1");
 const limit = parseInt(searchParams.get("limit") || "10");
 const skip = (page - 1) * limit;

 await dbConnect();
 
 const [reviews, total] = await Promise.all([
 ExternalReview.find({})
 .sort({ date: -1, createdAt: -1 })
 .skip(skip)
 .limit(limit)
 .lean(),
 ExternalReview.countDocuments({})
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

export async function POST(req: Request) {
 try {
 const authUser = await getCurrentUser();
 if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 await dbConnect();
 const dbUser = await User.findOne({ firebaseUid: authUser.uid });
 if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 const body = await req.json();
 const review = await ExternalReview.create(body);
 return NextResponse.json(review);
 } catch (error: any) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
