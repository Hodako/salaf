import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Review } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const body = await req.json();
        const review = await Review.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
        
        return NextResponse.json(review);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        return NextResponse.json({ message: "Review deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}
