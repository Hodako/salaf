import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Review, ExternalReview, Product } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Ensure Product model is initialized
        if (!Product) {
             throw new Error("Product model not found");
        }

        // Get distinct product IDs
        const internalIds = await Review.distinct("product", { isApproved: true });
        const externalIds = await ExternalReview.distinct("product", { isApproved: true, product: { $exists: true, $ne: null } });

        const combinedIds = Array.from(new Set([...internalIds.map(String), ...externalIds.map(String)]));

        const products = await Product.find({ _id: { $in: combinedIds } }, "_id name").lean();

        const formatted = products.map((p: any) => ({
            id: p._id.toString(),
            name: p.name
        }));

        // Sort alphabetically
        formatted.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error("Failed to fetch review filters:", error);
        return NextResponse.json({ error: "Failed to fetch review filters" }, { status: 500 });
    }
}
