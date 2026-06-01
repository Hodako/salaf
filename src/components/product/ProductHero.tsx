import Image from "next/image";
import { ProductHeroProps } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus } from "lucide-react";

export const ProductHero = ({ product }: ProductHeroProps) => {
    return (
        <section className="container mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-24 items-center md:items-start min-h-[70vh]">

            {/* Left Side: Product Image Showcase */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="relative w-full aspect-3/4 max-h-[600px] flex items-center justify-center p-8 bg-linear-to-br from-white/5 to-transparent rounded-2xl">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
                {/* Thumbnail Pagination Placeholder (for future multiple images) */}
                <div className="flex gap-2 mt-6">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="w-2 h-2 rounded-full bg-white/30"></span>
                </div>
            </div>

            {/* Right Side: Product Details & Actions */}
            <div className="w-full md:w-1/2 flex flex-col text-left space-y-8 mt-4 md:mt-12">
                <h1 className="text-4xl md:text-5xl font-heading font-medium text-white tracking-wide">
                    {product.name}
                </h1>

                <p className="text-gray-300 font-light leading-relaxed tracking-wide text-[15px] sm:text-[16px]">
                    Step into a world of unparalleled opulence with {product.name}, an exquisite fragrance that weaves an enchanting symphony of gold and luxury. This gilded elixir is a celebration of sophistication, crafted with the finest essences and imbued with the allure of precious golden hues.
                </p>

                {/* Rating & Reviews Placeholder */}
                <div className="flex items-center gap-2">
                    <div className="flex text-[#c06b40]">
                        {'★★★★★'.split('').map((star, i) => (
                            <span key={i} className="text-xl">{star}</span>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2 underline cursor-pointer">(90) Reviews and Ratings</span>
                </div>

                {/* Volume Selector Placeholder */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2 cursor-pointer opacity-100">
                        <div className="w-12 h-16 relative bg-white/5 p-2 rounded border border-[#c06b40]">
                            <Image src={product.images[0]} alt="100ml variant" fill className="object-contain p-1" />
                        </div>
                        <span className="text-xs text-white">100 ml</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 cursor-pointer opacity-50 hover:opacity-80 transition-opacity">
                        <div className="w-12 h-16 relative bg-white/5 p-2 rounded border border-transparent hover:border-white/20">
                            <Image src={product.images[0]} alt="150ml variant" fill className="object-contain p-1" />
                        </div>
                        <span className="text-xs text-gray-400">150 ml</span>
                    </div>
                </div>

                {/* Pricing Placeholder */}
                <div className="text-[#c06b40] text-xl font-medium tracking-wider pt-2">
                    ৳ {(product.variations?.[0]?.salePrice || product.variations?.[0]?.basePrice || 0).toLocaleString()}
                </div>

                {/* Checkout Actions Area */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                    <div className="flex gap-4 items-center">
                        <span className="text-xs text-gray-400 font-medium mr-2">Qty</span>
                        <div className="flex items-center border border-white/20 rounded-md h-10 px-2 bg-transparent w-32 justify-between">
                            <button className="text-white hover:text-[#c06b40] w-8 h-8 flex items-center justify-center transition-colors">
                                <Minus size={16} />
                            </button>
                            <span className="text-white font-medium">1</span>
                            <button className="text-white hover:text-[#c06b40] w-8 h-8 flex items-center justify-center transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Wishlist Toggle */}
                    <button className="flex items-center gap-2 text-white hover:text-[#c06b40] transition-colors font-medium tracking-wide">
                        Wishlist <Heart size={20} className="ml-1" />
                    </button>
                </div>

                {/* Add to Bag Button */}
                <Button className="w-full sm:w-[320px] h-12 bg-white hover:bg-gray-200 text-black font-semibold rounded-md transition-colors mt-2 text-md">
                    Add to Bag
                </Button>

                {/* Afterpay mock snippet */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <span className="bg-white text-black font-bold px-2 py-0.5 rounded-sm text-[10px]">afterpay</span>
                    <span>Shop now and pay later with 4 payments</span>
                </div>
            </div>
        </section>
    );
};
