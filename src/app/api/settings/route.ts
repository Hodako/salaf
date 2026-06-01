import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Settings } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Fetch public settings keys
        const settings = await Settings.find({
            key: { $in: ['hero_slides', 'spotlight_section', 'spotlight_sections'] }
        }).lean();

        const configMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        return NextResponse.json(configMap, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
}
