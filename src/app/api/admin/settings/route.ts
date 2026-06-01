import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Settings } from '@/models';

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Return a key-value map for easier consumption
        const settings = await Settings.find({}).lean();
        const configMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        return NextResponse.json(configMap, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const payload = await req.json(); // { key1: val1, key2: val2 }

        // Bulk upsert settings
        const bulkOps = Object.keys(payload).map(key => ({
            updateOne: {
                filter: { key },
                update: { $set: { value: payload[key] } },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await Settings.bulkWrite(bulkOps);
        }

        return NextResponse.json({ message: "Settings saved successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to save settings" }, { status: 500 });
    }
}
