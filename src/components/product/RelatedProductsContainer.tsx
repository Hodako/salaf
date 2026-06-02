import { dbConnect } from "@/helpers";
import { Product } from "@/models";
import { RelatedProducts } from "./RelatedProducts";

interface RelatedProductsContainerProps {
  collections: string[];
  productId: string;
}

/**
 * RelatedProductsContainer (RSC Server Component Container)
 * 
 * Progressively queries related items in the database that share collection 
 * tags with the current product, then renders the `<RelatedProducts>` grid.
 */
export async function RelatedProductsContainer({
  collections,
  productId,
}: RelatedProductsContainerProps) {
  await dbConnect();

  // Query up to 4 other products that belong to any of the same collections
  const relatedProductsRaw = await Product.find({
    collections: { $in: collections },
    _id: { $ne: productId }
  }).limit(4).lean();

  const relatedProductsPayload = JSON.parse(JSON.stringify(relatedProductsRaw));

  return <RelatedProducts products={relatedProductsPayload} />;
}
