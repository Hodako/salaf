import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbConnect } from '@/helpers';
import { User } from '@/models';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session?.value) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const { uid } = JSON.parse(session.value);
        await dbConnect();
        
        const user = await User.findOne({ firebaseUid: uid })
            .populate({
                path: 'wishlist',
                select: 'name slug featuredImage variations'
            })
            .lean();
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            uid: user.firebaseUid,
            role: user.role,
            email: user.email,
            name: user.name,
            phoneNumber: (user as any).phoneNumber,
            address: (user as any).address,
            wishlist: user.wishlist
        });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session?.value) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const { uid } = JSON.parse(session.value);
        const data = await req.json();

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { 
                $set: {
                    phoneNumber: data.phoneNumber,
                    address: data.address
                }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                phoneNumber: (user as any).phoneNumber,
                address: (user as any).address
            }
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
