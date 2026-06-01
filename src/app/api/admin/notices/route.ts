import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Notice, User } from '@/models';
import { getCurrentUser } from '@/helpers';

async function verifyAdmin() {
    const authUser = await getCurrentUser();
    if (!authUser) return null;
    
    await dbConnect();
    const user = await User.findOne({ firebaseUid: authUser.uid });
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET() {
    if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notices);
}

export async function POST(req: Request) {
    if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const body = await req.json();
        const notice = await Notice.create(body);
        return NextResponse.json(notice, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request) {
    if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const { id, ...data } = await req.json();
        const notice = await Notice.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(notice);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    if (!await verifyAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await Notice.findByIdAndDelete(id);
        return NextResponse.json({ message: "Notice deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
