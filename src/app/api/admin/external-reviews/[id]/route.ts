import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { ExternalReview } from "@/models";
import { getCurrentUser } from "@/helpers";
import User from "@/models/User";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        await ExternalReview.findByIdAndDelete(id);
        return NextResponse.json({ message: "Review deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const dbUser = await User.findOne({ firebaseUid: authUser.uid });
        if (!dbUser || dbUser.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = await params;
        const body = await req.json();
        const review = await ExternalReview.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        return NextResponse.json(review);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
