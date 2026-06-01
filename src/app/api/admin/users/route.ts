import { NextResponse } from "next/server";
import { getCurrentUser, dbConnect } from "@/helpers";
import { User } from "@/models";
import { escapeRegExp } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await User.findOne({ firebaseUid: authUser.uid });
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        let query: any = {};
        if (role) query.role = role;
        if (search) {
            const escapedSearch = escapeRegExp(search);
            query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { email: { $regex: escapedSearch, $options: 'i' } },
                { phoneNumber: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const authUser = await getCurrentUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await User.findOne({ firebaseUid: authUser.uid });
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { userId, role } = await req.json();

        if (userId === admin._id.toString()) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
