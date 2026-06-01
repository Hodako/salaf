import { NextResponse } from 'next/server';
import { dbConnect, getCurrentUser } from '@/helpers';
import { User } from '@/models';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        const auth = await getCurrentUser();
        if (!auth) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ firebaseUid: auth.uid });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if productId is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
             return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
        }

        const pId = new mongoose.Types.ObjectId(productId);
        const index = user.wishlist.findIndex(id => id.toString() === pId.toString());
        
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(pId);
        }

        await user.save();

        return NextResponse.json({ 
            message: "Wishlist updated", 
            wishlist: user.wishlist 
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const auth = await getCurrentUser();
        if (!auth) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const { productIds } = await req.json();
        if (!Array.isArray(productIds)) {
            return NextResponse.json({ message: "Product IDs must be an array" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ firebaseUid: auth.uid });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Merge and validate
        const existingSet = new Set(user.wishlist.map(id => id.toString()));
        productIds.forEach(id => {
            if (mongoose.Types.ObjectId.isValid(id)) {
                existingSet.add(id);
            }
        });
        
        user.wishlist = Array.from(existingSet).map(id => new mongoose.Types.ObjectId(id));
        await user.save();

        return NextResponse.json({ 
            message: "Wishlist synced", 
            wishlist: user.wishlist 
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
