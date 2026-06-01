import { NextResponse } from 'next/server';
import { dbConnect } from '@/helpers';
import { Newsletter } from '@/models';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // Basic email validation regex
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
        }

        await dbConnect();

        // Check if email already exists
        const existing = await Newsletter.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ message: "You are already subscribed!" }, { status: 400 });
        }

        await Newsletter.create({ email: email.toLowerCase() });

        return NextResponse.json({ message: "Subscription successful!" }, { status: 201 });

    } catch (error: any) {
        console.error("Newsletter Subscription Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
