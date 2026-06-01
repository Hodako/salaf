import { FeaturedProductsSectionData, IProduct } from "@/types";
import { ProductCard } from "./ProductCard";
import { Product, Collection } from "@/models";
import { dbConnect } from "@/helpers";

/**
 * A server component that displays a grid of featured products.
 * Mobile: Zero-gap 2-column grid (Amazon / Daraz style — no empty space).
 * Desktop: Normal spaced grid.
 */
interface FeaturedProductsProps {
  data: FeaturedProductsSectionData & {
    limit?: number;
    sort?: string;
    collectionSlug?: string;
    gridCols?: { desktop: string; tablet: string; mobile: string; };
  };
  isWidget?: boolean;
}

export const FeaturedProducts = async ({ data, isWidget }: FeaturedProductsProps) => {
  await dbConnect();

  let query: any = {};

  if (data.collectionSlug) {
    const slugs = data.collectionSlug.split(',').map(s => s.trim().toLowerCase());
    const collections = await Collection.find({ slug: { $in: slugs } }).select('_id');
    const collectionIds = collections.map(c => c._id);

    if (collectionIds.length > 0) {
      query.collections = { $in: collectionIds };
    } else {
      return null;
    }
  }

  let sortObj: any = { isOnSale: -1, createdAt: -1 };
  if (data.sort === 'price-asc') sortObj = { isOnSale: -1, 'variations.0.basePrice': 1 };
  if (data.sort === 'price-desc') sortObj = { isOnSale: -1, 'variations.0.basePrice': -1 };

  const limit = data.limit || 4;
  const rawProducts = await Product.find(query)
    .sort(sortObj)
    .limit(limit)
    .lean();

  const products = JSON.parse(JSON.stringify(rawProducts)) as IProduct[];

  if (!products || products.length === 0) {
    return null;
  }

  const dCols = data.gridCols?.desktop || '4';
  const tCols = data.gridCols?.tablet || '2';

  const desktopGridMap: Record<string, string> = {
    '2': 'lg:grid-cols-2', '3': 'lg:grid-cols-3',
    '4': 'lg:grid-cols-4', '5': 'lg:grid-cols-5',
  };
  const tabletGridMap: Record<string, string> = {
    '1': 'sm:grid-cols-1', '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3',
  };

  // Mobile: always 2 cols, zero gap — exactly like Amazon mobile grid
  const mobileClass = 'grid-cols-2';
  const tabletClass = tabletGridMap[tCols] || 'sm:grid-cols-2';
  const desktopClass = desktopGridMap[dCols] || 'lg:grid-cols-4';

  // Desktop gets normal gaps; mobile gets 0 gap (border used as separator)
  const gridClass = `grid ${mobileClass} ${tabletClass} ${desktopClass} gap-1 sm:gap-3 md:gap-6 lg:gap-8`;

  const GridContent = (
    <div className={gridClass}>
      {products.map((product) => (
        <div key={product._id.toString()} className="w-full">
          <ProductCard product={product as any} config={data.cardConfig} showReviews={false} />
        </div>
      ))}
    </div>
  );

  if (isWidget) {
    return GridContent;
  }

  return (
    <section className="w-full bg-[#f7f3ea] overflow-hidden
      px-0 py-0 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <div className="w-full sm:container sm:mx-auto">
        {data.title && (
          <div className="flex flex-col items-start sm:items-center justify-center
            mb-1 sm:mb-2 px-2 sm:px-0 pt-0 sm:pt-0">
            <h2
              className="text-[13px] sm:text-xl md:text-3xl font-heading font-bold
                text-foreground border-l-[3px] border-[#C29B38] pl-1.5 sm:border-0 sm:pl-0
                leading-tight sm:text-center sm:border-b-2 sm:border-[#C29B38] sm:pb-2 m-0"
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
          </div>
        )}
        {GridContent}
      </div>
    </section>
  );
};

export default FeaturedProducts;
