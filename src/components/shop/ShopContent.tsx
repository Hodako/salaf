"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, X } from "lucide-react";
import { useShopProducts } from "@/hooks/useShopProducts";
import { useCollections, useAuth, useAdminCategories } from "@/hooks";
import { ProductCard } from "@/components/home/ProductCard";
import { cn } from "@/lib/utils";
import { logViewItemList } from "@/lib/gtm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ShopContent({ initialFilters = {} }: { initialFilters?: { category?: string, subcategory?: string, collection?: string, brand?: string, title?: string } }) {
  const [filters, setFilters] = useState({
    category: initialFilters.category || "",
    subcategory: initialFilters.subcategory || "",
    collection: initialFilters.collection || "",
    brand: initialFilters.brand || "",
    sort: "newest",
    page: 1,
  });

 const { data: collections = [] } = useCollections();
 const { data: categories = [] } = useAdminCategories();
 const { data, isLoading } = useShopProducts(filters);

 const products = data?.products || [];
 const totalPages = data?.totalPages || 1;

 useEffect(() => {
 if (products.length > 0) {
 logViewItemList(products, "Shop Page");
 }
 }, [products]);

 return (
 <div className="w-full bg-background min-h-screen text-foreground pb-20 sm:pb-8 overflow-x-hidden">
 {/* Header */}
 <div className="container mx-auto px-5 sm:px-6 md:px-8 pt-0.5 md:pt-8 pb-0 sm:pb-3 text-left">
   <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-border/40 px-0 pb-1 sm:pb-3 mb-1 sm:mb-4 gap-0.5 sm:gap-2">
     <div>
       <h1 className="text-[14px] md:text-2xl font-bold tracking-wide text-foreground uppercase leading-tight">
         {initialFilters.title || "Best Selling Products"}
       </h1>
       {/* Results Metadata */}
       <p className="text-[9px] sm:text-xs text-muted-foreground mt-0 font-medium leading-tight">
         Showing 1-{products.length} of {products.length} results
       </p>
     </div>

     {/* Render Active Filter Pills */}
     {(filters.category || filters.subcategory || filters.collection) && (
       <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0">
         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Active:</span>
         {filters.category && (
           <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 animate-fade-in">
             {filters.category}
             <button onClick={() => setFilters(prev => ({ ...prev, category: "", subcategory: "", page: 1 }))} className="hover:text-foreground">
               <X className="w-2.5 h-2.5" />
             </button>
           </span>
         )}
         {filters.subcategory && (
           <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 animate-fade-in">
             {filters.subcategory}
             <button onClick={() => setFilters(prev => ({ ...prev, subcategory: "", page: 1 }))} className="hover:text-foreground">
               <X className="w-2.5 h-2.5" />
             </button>
           </span>
         )}
         {filters.collection && (
           <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20 animate-fade-in">
             {filters.collection}
             <button onClick={() => setFilters(prev => ({ ...prev, collection: "", page: 1 }))} className="hover:text-foreground">
               <X className="w-2.5 h-2.5" />
             </button>
           </span>
         )}
       </div>
     )}
   </div>

 {/* Filter Bar (Desktop) */}
 <div className="hidden lg:flex items-center justify-between gap-4 border-b border-border/40 py-2.5 mb-6">
 <div className="flex items-center gap-6">
 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Filter by</span>
 
 <FilterDropdown 
 label="Categories" 
 options={[{ label: "All Categories", value: "" }, ...categories.filter((c: any) => c.level === 0).map((c: any) => ({ label: c.name, value: c.slug }))]} 
 value={filters.category}
 onChange={(val) => setFilters(prev => ({ ...prev, category: val, subcategory: "", page: 1 }))}
 />

 {filters.category && (
 <FilterDropdown 
 label="Subcategories" 
 options={[{ label: "All Subcategories", value: "" }, ...categories.filter((c: any) => c.level === 1 && c.parent === categories.find((cat: any) => cat.slug === filters.category)?._id).map((c: any) => ({ label: c.name, value: c.slug }))]} 
 value={filters.subcategory}
 onChange={(val) => setFilters(prev => ({ ...prev, subcategory: val, page: 1 }))}
 />
 )}

 <FilterDropdown 
 label="Collections" 
 options={[{ label: "All Collections", value: "" }, ...collections.map((c: any) => ({ label: c.name, value: c.slug }))]} 
 value={filters.collection}
 onChange={(val) => setFilters(prev => ({ ...prev, collection: val, page: 1 }))}
 />
 </div>

 <div className="flex items-center gap-4">
 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sort by</span>
 <FilterDropdown 
 label="Sort By" 
 options={[
 { label: "Newest", value: "newest" },
 { label: "Price: Low to High", value: "price_asc" },
 { label: "Price: High to Low", value: "price_desc" },
 { label: "Popularity", value: "popularity" },
 ]} 
 value={filters.sort}
 onChange={(val) => setFilters(prev => ({ ...prev, sort: val, page: 1 }))}
 />
 </div>
 </div>

 {/* Filter Bar (Mobile) */}
 <div className="flex lg:hidden items-center justify-between border-b border-border/40 px-4 py-1 gap-2 mb-1">
 <Sheet>
 <SheetTrigger asChild>
 <Button variant="outline" size="sm" className="w-full h-8 flex items-center justify-center gap-1.5 border-amber-500 text-amber-600 font-extrabold uppercase tracking-wider text-[9px] rounded-full hover:bg-amber-500 hover:text-white transition-all bg-background shadow-xs">
 <SlidersHorizontal className="w-3 h-3" />
 Filters & Sort
 </Button>
 </SheetTrigger>
 <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-0 p-0 flex flex-col pt-4 pb-0 bg-background">
 <SheetHeader className="px-6 py-4 border-b border-border">
 <SheetTitle className="text-sm font-bold uppercase tracking-widest text-center text-foreground">Filters & Sorting</SheetTitle>
 </SheetHeader>
 
 <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort By</h3>
 <div className="grid grid-cols-2 gap-3">
 {[
 { label: "Newest", value: "newest" },
 { label: "Price: Low to High", value: "price_asc" },
 { label: "Price: High to Low", value: "price_desc" },
 { label: "Popularity", value: "popularity" },
 ].map((opt) => (
 <button
 key={opt.value}
 onClick={() => setFilters(prev => ({ ...prev, sort: opt.value, page: 1 }))}
 className={cn(
 "px-3 py-3 text-xs font-semibold rounded-xl border transition-all text-center",
 filters.sort === opt.value 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
 <div className="grid sm:grid-cols-2 gap-3">
 <button
 onClick={() => setFilters(prev => ({ ...prev, category: "", subcategory: "", page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.category === "" 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 All Categories
 </button>
 {categories.filter((c: any) => c.level === 0).map((c: any) => (
 <button
 key={c.slug}
 onClick={() => setFilters(prev => ({ ...prev, category: c.slug, subcategory: "", page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.category === c.slug 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 {c.name}
 </button>
 ))}
 </div>
 </div>

 {filters.category && (
 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subcategories</h3>
 <div className="grid sm:grid-cols-2 gap-3">
 <button
 onClick={() => setFilters(prev => ({ ...prev, subcategory: "", page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.subcategory === "" 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 All Subcategories
 </button>
 {categories.filter((c: any) => c.level === 1 && c.parent === categories.find((cat: any) => cat.slug === filters.category)?._id).map((c: any) => (
 <button
 key={c.slug}
 onClick={() => setFilters(prev => ({ ...prev, subcategory: c.slug, page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.subcategory === c.slug 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 {c.name}
 </button>
 ))}
 </div>
 </div>
 )}

 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Collections</h3>
 <div className="grid sm:grid-cols-2 gap-3">
 <button
 onClick={() => setFilters(prev => ({ ...prev, collection: "", page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.collection === "" 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 All Collections
 </button>
 {collections.map((c: any) => (
 <button
 key={c.slug}
 onClick={() => setFilters(prev => ({ ...prev, collection: c.slug, page: 1 }))}
 className={cn(
 "px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left",
 filters.collection === c.slug 
 ? "border-bprimary bg-bprimary/10 text-bprimary-dark" 
 : "border-border/50 text-foreground"
 )}
 >
 {c.name}
 </button>
 ))}
 </div>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 </div>
 </div>

 {/* Grid */}
 <div className="w-full px-5 sm:container sm:mx-auto sm:px-6 md:px-8">
 {isLoading ? (
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-3 md:gap-6">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="aspect-square bg-muted animate-pulse" />
 ))}
 </div>
 ) : products.length === 0 ? (
 <div className="py-12 sm:py-20 px-4 text-center text-sm text-muted-foreground">
 No products found matching your criteria.
 </div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-3 md:gap-6">
 {products.map((product) => (
 <ProductCard 
 key={product._id} 
 product={product} 
 config={{ showPrice: true, showVolume: true, listName: "Shop Page" }} 
 />
 ))}
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="mt-20 flex items-center justify-center gap-8 border-t border-border pt-12">
 <button 
 disabled={filters.page === 1}
 onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
 className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
 >
 <ChevronLeft className="w-6 h-6" />
 </button>
 
 <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
 Page <span className="text-foreground">{filters.page}</span> of {totalPages}
 </span>

 <button 
 disabled={filters.page === totalPages}
 onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
 className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
 >
 <ChevronRight className="w-6 h-6" />
 </button>
 </div>
 )}
 </div>
 </div>
 );
}

function FilterDropdown({ label, options, value, onChange }: { label: string, options: { label: string, value: string }[], value: string, onChange: (val: string) => void }) {
 const [isOpen, setIsOpen] = useState(false);
 const selectedLabel = options.find(o => o.value === value)?.label || label;

 return (
 <div className="relative">
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
 >
 {selectedLabel}
 <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
 </button>

 {isOpen && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
 <div className="absolute top-full left-0 mt-4 w-48 bg-card border border-border rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
 {options.map((opt) => (
 <button
 key={opt.value}
 onClick={() => {
 onChange(opt.value);
 setIsOpen(false);
 }}
 className={cn( "w-full text-left px-4 py-3 text-xs font-medium transition-colors hover:bg-muted ", value === opt.value ? "text-bprimary-dark bg-muted " : "text-muted-foreground" )}
 >
 {opt.label}
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 );
}
