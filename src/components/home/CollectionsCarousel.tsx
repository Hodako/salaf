import { Collection } from "@/models";
import { dbConnect } from "@/helpers";
import CollectionsCarouselClient from "./CollectionsCarouselClient";

/**
 * A server component that fetches all collections with images to pre-populate 
 * the interactive carousel.
 */
export default async function CollectionsCarousel() {
    await dbConnect();

    // Fetch collections that have an image URL
    const rawCollections = await Collection.find({
        imageUrl: { $exists: true, $ne: "" }
    }).sort({ createdAt: -1 }).lean();

    // Serialize for the client component
    const collections = JSON.parse(JSON.stringify(rawCollections));

    if (!collections || collections.length === 0) return null;

    return <CollectionsCarouselClient collections={collections} />;
}
