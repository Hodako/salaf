import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbConnect } from '@/helpers';
import { User } from '@/models';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firebaseUid, email, name, image } = body;

        if (!firebaseUid || !email || !name) {
            return NextResponse.json({ message: "Missing required user fields" }, { status: 400 });
        }

        await dbConnect();

        // 1. Try to find existing user
        let user = await User.findOne({
            $or: [{ firebaseUid }, { email }]
        });

        // 2. If user exists, update their firebase UID if it was matched by email
        // or just return their role if they are completely matched.
        if (user) {
            if (user.firebaseUid !== firebaseUid) {
                user.firebaseUid = firebaseUid;
                await user.save();
            }

            // Set session cookie for proxy.ts
            const cookieStore = await cookies();
            cookieStore.set('session', JSON.stringify({ uid: user.firebaseUid, role: user.role, email: user.email }), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return NextResponse.json({
                message: "User synced successfully",
                role: user.role
            }, { status: 200 });
        }

        // 3. If user doesn't exist, create them
        user = await User.create({
            firebaseUid,
            email,
            name,
            image,
            role: 'customer' // Default role
        });

        // Set session cookie for proxy.ts
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify({ uid: user.firebaseUid, role: user.role, email: user.email }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return NextResponse.json({
            message: "User created successfully",
            role: user.role
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
    }
}
