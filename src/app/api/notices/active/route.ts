import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Notice } from '@/models';

export async function GET() {
    try {
        await dbConnect();
        
        const now = new Date();
        const activeNotices = await Notice.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
        .sort({ priority: -1, createdAt: -1 })
        .select('content');

        return NextResponse.json(activeNotices, { status: 200 });

    } catch (error: any) {
        console.error("Fetch Active Notices Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
