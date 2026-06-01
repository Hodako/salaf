import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Newsletter, User } from '@/models';
import { getCurrentUser } from '@/helpers';

export async function GET() {
    try {
        const authUser = await getCurrentUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Ensure user is admin
        // Skip DB admin role check in dev mode
        const isDev = process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true';
        if (!isDev) {
            const dbUser = await User.findOne({ firebaseUid: authUser.uid });
                    if (!dbUser || dbUser.role !== 'admin') {
                        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                    }
        }

        const subscribers = await Newsletter.find({})
            .sort({ subscribedAt: -1 })
            .select('email subscribedAt');

        return NextResponse.json(subscribers, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
