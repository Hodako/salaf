import { ProductCard } from "@/components/home/ProductCard";
import { RelatedProductsProps, ClientProduct } from "@/types";

export function RelatedProducts({ products: rawProducts }: RelatedProductsProps) {
    if (!rawProducts || rawProducts.length === 0) return null;

    // Serialize for Client Component
    const products = JSON.parse(JSON.stringify(rawProducts)) as ClientProduct[];

    return (
        <section className="py-12 md:py-24 border-t border-border">
            <h2 className="text-3xl md:text-5xl font-heading font-medium text-center text-bprimary-dark mb-10 md:mb-20 tracking-wide">
                Discover More
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 justify-center">
                {products.map((product) => (
                    <ProductCard
                        key={(product as any)._id}
                        product={product}
                        config={{ showPrice: true, showVolume: true, listName: "Related Products" }}
                        showReviews={true}
                    />
                ))}
            </div>
        </section>
    );
}
