"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, X, Lightbulb, Info, AlertCircle, Image as ImageIcon, CheckCircle2, Circle, Search, Sparkles, Type, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    CMSEditor,
    ImgBBUploader,
    TaxonomySelect,
    VariationManager,
    FormFieldLabel,
    HelpTooltip
} from "@/components/admin/products";
import { ISection, IVariation, IVariationForm } from "@/types";
import { useTags, useCollections, useCreateTag, useCreateCollection, useAdminCategories } from "@/hooks";
import { useAdminBrands, useCreateBrand } from "@/hooks/useAdminBrands";
import { cn } from "@/lib/utils";

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isPending: boolean;
    title: string;
}

export function ProductForm({ initialData, onSubmit, isPending, title }: ProductFormProps) {
    const router = useRouter();

    // Taxonomy Hooks
    const { data: tags = [], isLoading: isLoadingTags } = useTags();
    const { data: collections = [], isLoading: isLoadingCollections } = useCollections();
    const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();
    const { mutateAsync: createCollection, isPending: isCreatingCollection } = useCreateCollection();
    const { data: brands = [], isLoading: isLoadingBrands } = useAdminBrands();
    const { mutateAsync: createBrand, isPending: isCreatingBrand } = useCreateBrand();
    const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategories();

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        skuPrefix: "",
        featuredImage: "",
        images: [] as string[],
        tags: [] as string[],
        collections: [] as string[],
        category: "",
        subcategory: "",
        subSubcategory: "",
        attributes: [] as { key: string; value: string }[],
        seoTitle: "",
        seoDescription: "",
        brand: "" as string,
        variations: [] as IVariationForm[],
        detailsSections: [] as ISection[],
        isOnSale: false,
        faqEnabled: false,
        faqs: [] as { question: string; answer: string }[],
    });

    const [uniqueness, setUniqueness] = useState({
        slug: { checking: false, available: true, error: "" },
        skuPrefix: { checking: false, available: true, error: "" }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                tags: initialData.tags?.map((t: any) => typeof t === 'string' ? t : t._id) || [],
                collections: initialData.collections?.map((c: any) => typeof c === 'string' ? c : c._id) || [],
                brand: typeof initialData.brand === 'string' ? initialData.brand : initialData.brand?._id || "",
                category: typeof initialData.category === 'string' ? initialData.category : initialData.category?._id || "",
                subcategory: typeof initialData.subcategory === 'string' ? initialData.subcategory : initialData.subcategory?._id || "",
                subSubcategory: typeof initialData.subSubcategory === 'string' ? initialData.subSubcategory : initialData.subSubcategory?._id || "",
                attributes: initialData.attributes || [],
                variations: initialData.variations?.map((v: any) => ({
                    ...v,
                    basePrice: v.basePrice.toString(),
                    salePrice: v.salePrice?.toString() || "",
                    stock: v.stock !== undefined ? v.stock.toString() : "10"
                })) || [],
                detailsSections: initialData.detailsSections?.map((s: any) => ({
                    ...s,
                    _clientId: s._clientId || Math.random().toString(36).substr(2, 9),
                    data: s.data || {}
                })) || [],
                isOnSale: !!initialData.isOnSale,
                faqEnabled: !!initialData.faqEnabled,
                faqs: initialData.faqs || [],
            });
        }
    }, [initialData]);

    const checkUniqueness = async (type: 'slug' | 'skuPrefix', value: string) => {
        if (!value) return;
        if (initialData && initialData[type] === value) {
            setUniqueness(prev => ({ ...prev, [type]: { checking: false, available: true, error: "" } }));
            return;
        }

        setUniqueness(prev => ({ ...prev, [type]: { ...prev[type], checking: true } }));
        try {
            const endpoint = type === 'slug' ? '/api/admin/products/check-slug' : '/api/admin/products/check-sku-prefix';
            const param = type === 'slug' ? `slug=${value}` : `prefix=${value}`;
            const res = await fetch(`${endpoint}?${param}`);
            const data = await res.json();
            setUniqueness(prev => ({
                ...prev,
                [type]: { checking: false, available: data.available, error: data.available ? "" : `${type === 'slug' ? 'Slug' : 'SKU Prefix'} is already taken` }
            }));
        } catch (error) {
            setUniqueness(prev => ({ ...prev, [type]: { checking: false, available: true, error: "" } }));
        }
    };

    const debounce = (fn: Function, ms: number) => {
        let timeoutId: any;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), ms);
        };
    };

    const debouncedCheckSlug = debounce((v: string) => checkUniqueness('slug', v), 500);
    const debouncedCheckSku = debounce((v: string) => checkUniqueness('skuPrefix', v), 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'slug') debouncedCheckSlug(value);
        if (name === 'skuPrefix') {
            const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setFormData(prev => ({ ...prev, skuPrefix: formatted }));
            debouncedCheckSku(formatted);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const generatedPrefix = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);

        setFormData(prev => ({
            ...prev,
            name,
            slug: prev.slug === '' || (initialData?.slug && prev.slug === initialData.slug) || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ? slug : prev.slug,
            skuPrefix: prev.skuPrefix === '' || (initialData?.skuPrefix && prev.skuPrefix === initialData.skuPrefix) || prev.skuPrefix === (prev.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)) ? generatedPrefix : prev.skuPrefix,
            seoTitle: prev.seoTitle === '' || (initialData?.seoTitle && prev.seoTitle === initialData.seoTitle) || prev.seoTitle === prev.name ? name : prev.seoTitle
        }));

        if (name) {
            debouncedCheckSlug(slug);
            debouncedCheckSku(generatedPrefix);
        }
    };

    const buildPayload = () => {
        const payload: any = {
            ...formData,
            attributes: formData.attributes,
            variations: formData.variations.map((v: IVariationForm) => ({
                ...v,
                basePrice: Number(v.basePrice),
                salePrice: v.salePrice ? Number(v.salePrice) : undefined,
                stock: v.stock ? Number(v.stock) : 10,
                sku: `${formData.skuPrefix}${v.volume}${v.volumeUnit.toUpperCase()}`
            })),
            faqEnabled: formData.faqEnabled,
            faqs: formData.faqs,
        };

        // Prevent Mongoose cast errors by cleaning up empty string / falsy ObjectId fields
        if (!payload.brand) delete payload.brand;
        if (!payload.category) delete payload.category;
        if (!payload.subcategory) delete payload.subcategory;
        if (!payload.subSubcategory) delete payload.subSubcategory;

        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uniqueness.slug.available || !uniqueness.skuPrefix.available) {
            toast.error("Please resolve uniqueness errors before saving.");
            return;
        }
        await onSubmit(buildPayload());
    };

    // --- ADVANCED ANALYSIS ENGINE ---
    const analyzeProduct = () => {
        const nameKeywords = formData.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);

        // Helper to extract text from various section data structures
        const getSectionText = (s: ISection): string => {
            const d = s.data as any;
            if (!d) return "";
            return [
                d.htmlContent,
                d.text,
                d.title,
                d.description,
                d.subtitle,
                ...(d.paragraphs || []),
                ...(d.features?.map((f: any) => `${f.title} ${f.description}`) || []),
                ...(d.items?.map((i: any) => `${i.title} ${i.content}`) || [])
            ].filter(Boolean).join(" ");
        };

        const descText = formData.detailsSections.map(getSectionText).join(" ").toLowerCase();
        const seoDescText = formData.seoDescription.toLowerCase();
        const seoTitleText = formData.seoTitle.toLowerCase();
        const productName = formData.name.toLowerCase();

        // 1. Name & Description Alignment
        const nameInDesc = nameKeywords.filter(w => descText.includes(w)).length;
        const nameDescScore = nameKeywords.length > 0 ? (nameInDesc / nameKeywords.length) * 100 : 0;

        // 2. SEO Title Alignment (Granular keyword check)
        const titleKeywords = seoTitleText.split(/\s+/).filter(w => w.length > 2);
        const nameKeywordsInTitle = nameKeywords.filter(w => seoTitleText.includes(w)).length;
        const seoTitleScore = nameKeywords.length > 0 ? (nameKeywordsInTitle / nameKeywords.length) * 100 : 0;

        // 3. SEO Description Alignment
        const seoDescKeywords = seoDescText.split(/\s+/).filter(w => w.length > 3);
        const seoDescInProduct = seoDescKeywords.filter(w => descText.includes(w)).length;
        const seoDescMatchScore = seoDescKeywords.length > 0 ? (seoDescInProduct / seoDescKeywords.length) * 100 : 0;

        // 4. Content Richness
        const richnessScore = Math.min(100, (formData.seoDescription.length / 160) * 50 + (titleKeywords.length / 5) * 50);

        return {
            nameDescScore: Math.round(nameDescScore),
            seoTitleScore: Math.round(seoTitleScore),
            seoDescMatchScore: Math.round(seoDescMatchScore),
            seoRichness: Math.round(richnessScore),
            overall: Math.round((nameDescScore + seoTitleScore + seoDescMatchScore + richnessScore) / 4)
        };
    };

    const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeProduct> | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const handlePreSave = (e: React.FormEvent) => {
        e.preventDefault();
        const report = analyzeProduct();
        setAnalysis(report);
        setShowAnalysis(true);
    };

    const confirmSave = () => {
        setShowAnalysis(false);
        const e = { preventDefault: () => { } } as React.FormEvent;
        handleSubmit(e);
    };

    return (
        <>
            <form onSubmit={handlePreSave} className="flex flex-col gap-8 min-h-screen pb-20 p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[-24px] md:top-[-32px] -mt-6 md:-mt-8 z-30 bg-black/95 backdrop-blur-xl py-6 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                        <p className="text-gray-500 mt-1">Manage product details, pricing and variations.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !uniqueness.slug.available || !uniqueness.skuPrefix.available}
                            className="bg-[#c06b40] hover:bg-[#a65a35] text-white px-8 h-11 rounded-full font-medium transition-all shadow-lg shadow-[#c06b40]/20 flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {initialData ? "Update Product" : "Save Product"}
                        </Button>
                    </div>
                </div>

                {/* Step-by-Step Mentor UI */}
                {(() => {
                    const report = analyzeProduct();
                    interface TipState { title: string; msg: string; color: string; step: number };

                    let activeTip: TipState = {
                        step: 1,
                        title: "Step 1: Identity",
                        msg: "Let's start with a strong name. A good organic product name includes the type or grade (e.g., 'Premium Sundarban Raw Honey' or 'Cold Pressed Mustard Oil').",
                        color: "text-blue-400"
                    };
 
                    if (formData.name && formData.variations.length === 0) {
                        activeTip = {
                            step: 2,
                            title: "Step 2: Pricing & Stock",
                            msg: "Great name! Now, add a size, price and stock levels. Consider if you want to offer a discount (Sale Price) to attract buyers.",
                            color: "text-emerald-400"
                        };
                    } else if (formData.variations.length > 0 && formData.detailsSections.length === 0) {
                        activeTip = {
                            step: 3,
                            title: "Step 3: The Story",
                            msg: "Price is set. Now, describe the quality and source. Mention organic certifications, health benefits, and direct sourcing origins so customers can trust the purity.",
                            color: "text-purple-400"
                        };
                    } else if (formData.detailsSections.length > 0 && !formData.featuredImage) {
                        activeTip = {
                            step: 4,
                            title: "Step 4: Visuals",
                            msg: "A story needs a face. Upload high-quality, natural images. Clear, well-lit photos showing the actual product texture work best.",
                            color: "text-pink-400"
                        };
                    } else if (formData.featuredImage && report.overall < 80) {
                        activeTip = {
                            step: 6,
                            title: "Final Step: SEO Audit",
                            msg: "Almost ready! Your SEO Title and Description should contain your Product Name naturally to help people find you on Google.",
                            color: "text-green-400"
                        };
                    } else if (report.overall >= 80) {
                        activeTip = {
                            step: 7,
                            title: "Perfectly Optimized",
                            msg: "Your listing is enterprise-grade. All keywords are aligned and visuals are set. You're ready to publish!",
                            color: "text-orange-400"
                        };
                    }

                    return (
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl transition-all duration-500">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <Sparkles className={cn("w-5 h-5", activeTip.color)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", activeTip.color)}>{activeTip.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">{activeTip.msg}</p>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Listing Health</span>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className={cn("h-full transition-all duration-1000", report.overall > 80 ? "bg-green-500" : "bg-[#c06b40]")} style={{ width: `${report.overall}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Basic Info Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-medium text-white">Essential Information</h2>
                                </div>
                                <p className="text-[10px] text-gray-500 italic">Fields marked with * are required</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Product Name" tooltip="The public name of your perfume (e.g. Amber Oud Gold)." required />
                                <Input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Luxurious Amber Oud"
                                    className="bg-black border-white/10 h-12 text-lg focus:ring-[#c06b40]/20 font-medium"
                                />
                                <p className="text-[10px] text-gray-500 ml-1">Tip: Use a descriptive name that includes the main scent notes.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2 relative">
                                    <FormFieldLabel label="Slug" tooltip="URL-friendly version of the name. Auto-generated if left blank." />
                                    <div className="relative">
                                        <input
                                            required
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="luxurious-amber"
                                            className={cn(
                                                "w-full bg-black border rounded-md px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#c06b40] transition-colors",
                                                uniqueness.slug.error ? "border-red-500/50" : "border-white/10"
                                            )}
                                        />
                                        {uniqueness.slug.checking && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />}
                                        {!uniqueness.slug.checking && formData.slug && (
                                            <span className={cn(
                                                "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold",
                                                uniqueness.slug.available ? "text-green-500" : "text-red-500"
                                            )}>
                                                {uniqueness.slug.available ? "✓ AVAILABLE" : "✗ TAKEN"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 ml-1 italic">salaf.com/product/{formData.slug || "..."}</p>
                                    {uniqueness.slug.error && <p className="text-[10px] text-red-500 ml-1">{uniqueness.slug.error}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <FormFieldLabel label="SKU Prefix" tooltip="A unique short code (2-8 chars) representing this product line." required />
                                    <div className="relative">
                                        <input
                                            required
                                            name="skuPrefix"
                                            value={formData.skuPrefix}
                                            onChange={handleChange}
                                            placeholder="e.g. AMBER"
                                            className={cn(
                                                "w-full bg-black border rounded-md px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#c06b40] transition-colors",
                                                uniqueness.skuPrefix.error ? "border-red-500/50" : "border-white/10"
                                            )}
                                        />
                                        {uniqueness.skuPrefix.checking && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />}
                                        {!uniqueness.skuPrefix.checking && formData.skuPrefix && (
                                            <span className={cn(
                                                "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold",
                                                uniqueness.skuPrefix.available ? "text-green-500" : "text-red-500"
                                            )}>
                                                {uniqueness.skuPrefix.available ? "✓ AVAILABLE" : "✗ TAKEN"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 ml-1">Full SKUs will look like: {formData.skuPrefix || "PREFIX"}100ML</p>
                                    {uniqueness.skuPrefix.error && <p className="text-[10px] text-red-500 ml-1">{uniqueness.skuPrefix.error}</p>}
                                </div>
                            </div>

                            {/* Sale Status Checkbox */}
                            <div 
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-red-500/30 transition-all cursor-pointer select-none"
                                onClick={() => setFormData(prev => ({ ...prev, isOnSale: !prev.isOnSale }))}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300",
                                    formData.isOnSale ? "bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "border-white/20"
                                )}>
                                    {formData.isOnSale && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white uppercase tracking-wider">Is on Sale?</span>
                                    <p className="text-[10px] text-gray-500 italic">Marking this as on sale will prioritize it in product grids and show the SALE badge.</p>
                                </div>
                            </div>
                        </div>

                        {/* Variations Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Pricing & Sizes</h2>
                            </div>
                            <VariationManager
                                variations={formData.variations}
                                onChange={(v: IVariationForm[]) => setFormData(prev => ({ ...prev, variations: v }))}
                            />
                        </div>

                        {/* Features/Details Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Product Story</h2>
                            </div>
                            <CMSEditor
                                sections={formData.detailsSections}
                                onChange={(sections) => setFormData(prev => ({ ...prev, detailsSections: sections }))}
                            />
                        </div>
                    </div>

                    {/* Right Column - Media & Taxonomy */}
                    <div className="flex flex-col gap-8">
                        {/* Media Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Visual Assets</h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Featured Image" tooltip="The main image shown in product listings and search results." />
                                <ImgBBUploader
                                    value={formData.featuredImage}
                                    onChange={(url) => setFormData(prev => {
                                        const nextImages = prev.images.includes(url) ? prev.images : [url, ...prev.images];
                                        return { ...prev, featuredImage: url, images: nextImages };
                                    })}
                                />
                                <p className="text-[10px] text-gray-500 italic">Recommended: 1000x1000px square image.</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Image Gallery" tooltip="Additional photos showing different angles or packaging." />
                                <div className="grid grid-cols-2 gap-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} className="w-full aspect-square object-cover rounded-lg border border-white/10" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <ImgBBUploader
                                        value=""
                                        onChange={(url) => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500">You can add up to 5 additional images.</p>
                            </div>
                        </div>

                        {/* Specifications Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Product Specifications</h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData(prev => ({ ...prev, attributes: [...prev.attributes, { key: "", value: "" }] }))}
                                    className="bg-[#c06b40]/10 border-[#c06b40]/30 text-[#c06b40] hover:bg-[#c06b40] hover:text-white transition-all text-xs h-8"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Spec
                                </Button>
                            </div>

                            {formData.attributes.length === 0 ? (
                                <p className="text-sm text-gray-500 italic text-center py-6">No custom specifications added yet. (e.g. Origin, Purity, Certification)</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {formData.attributes.map((attr, idx) => (
                                        <div key={idx} className="flex gap-2 items-center animate-in fade-in duration-200">
                                            <Input
                                                placeholder="Key (e.g. Origin)"
                                                value={attr.key}
                                                onChange={(e) => {
                                                    const newAttrs = [...formData.attributes];
                                                    newAttrs[idx].key = e.target.value;
                                                    setFormData(prev => ({ ...prev, attributes: newAttrs }));
                                                }}
                                                className="bg-black border-white/10 h-10 flex-1"
                                            />
                                            <Input
                                                placeholder="Value (e.g. Sundarban)"
                                                value={attr.value}
                                                onChange={(e) => {
                                                    const newAttrs = [...formData.attributes];
                                                    newAttrs[idx].value = e.target.value;
                                                    setFormData(prev => ({ ...prev, attributes: newAttrs }));
                                                }}
                                                className="bg-black border-white/10 h-10 flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== idx) }));
                                                }}
                                                className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Organization Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Organization</h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Brand" tooltip="The manufacturer or brand of this product." />
                                <TaxonomySelect
                                    placeholder="Select Brand"
                                    items={brands.map(b => ({ _id: b._id, name: b.name }))}
                                    selectedIds={formData.brand ? [formData.brand] : []}
                                    onChange={(ids) => setFormData(prev => ({ ...prev, brand: ids[ids.length - 1] || "" }))}
                                    isLoading={isLoadingBrands}
                                    multiple={false}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <FormFieldLabel label="Main Category" tooltip="The primary catalog category." required />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: "", subSubcategory: "" }))}
                                        className="bg-black border border-white/10 rounded-md px-4 py-2 text-white h-10 focus:outline-none focus:border-[#c06b40] transition-colors text-sm"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.filter((c: any) => c.level === 0).map((c: any) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <FormFieldLabel label="Subcategory" tooltip="Specific sub-group under the category." />
                                    <select
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value, subSubcategory: "" }))}
                                        className="bg-black border border-white/10 rounded-md px-4 py-2 text-white h-10 focus:outline-none focus:border-[#c06b40] transition-colors text-sm disabled:opacity-40"
                                        disabled={!formData.category}
                                    >
                                        <option value="">None</option>
                                        {categories.filter((c: any) => c.level === 1 && c.parent === formData.category).map((c: any) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Collections (Marketing)" tooltip="Curated groups for marketing (e.g. Best Sellers, Winter Deals)." />
                                <TaxonomySelect
                                    placeholder="Select collections"
                                    items={collections}
                                    selectedIds={formData.collections}
                                    onChange={(ids) => setFormData(prev => ({ ...prev, collections: ids }))}
                                    onCreate={(name) => createCollection({ name })}
                                    isLoading={isLoadingCollections}
                                    isCreating={isCreatingCollection}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="Tags" tooltip="Keywords for searching and SEO tags." />
                                <TaxonomySelect
                                    placeholder="Select tags"
                                    items={tags}
                                    selectedIds={formData.tags}
                                    onChange={(ids) => setFormData(prev => ({ ...prev, tags: ids }))}
                                    onCreate={(name) => createTag({ name })}
                                    isLoading={isLoadingTags}
                                    isCreating={isCreatingTag}
                                />
                            </div>
                        </div>

                        {/* SEO Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Search Engine Optimization</h2>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="SEO Title" tooltip="Custom title for search result pages (SERPs)." />
                                <Input
                                    name="seoTitle"
                                    value={formData.seoTitle}
                                    onChange={handleChange}
                                    placeholder="Custom meta title"
                                    className="bg-black border-white/10"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-gray-500 italic">Recommended: 50-60 characters.</p>
                                    <span className={cn("text-[9px] font-bold", formData.seoTitle.length > 60 ? "text-red-400" : "text-green-500")}>
                                        {formData.seoTitle.length}/60
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <FormFieldLabel label="SEO Description" tooltip="Brief summary shown in search results." />
                                <textarea
                                    name="seoDescription"
                                    value={formData.seoDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                                    placeholder="Custom meta description for search engines..."
                                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white h-24 focus:outline-none focus:border-[#c06b40] transition-colors resize-none text-sm"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-gray-500 italic">Recommended: 120-160 characters.</p>
                                    <span className={cn("text-[9px] font-bold", formData.seoDescription.length > 160 ? "text-red-400" : "text-green-500")}>
                                        {formData.seoDescription.length}/160
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ settings Box */}
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-xl font-medium text-white">Frequently Asked Questions</h2>
                            </div>

                            {/* FAQ Enable Checkbox */}
                            <div 
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-[#c06b40]/30 transition-all cursor-pointer select-none"
                                onClick={() => setFormData(prev => ({ ...prev, faqEnabled: !prev.faqEnabled }))}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300",
                                    formData.faqEnabled ? "bg-[#c06b40] border-[#c06b40] shadow-[0_0_15px_rgba(192,107,64,0.4)]" : "border-white/20"
                                )}>
                                    {formData.faqEnabled && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white uppercase tracking-wider">Enable FAQ Section</span>
                                    <p className="text-[10px] text-gray-500 italic">Toggle whether the Frequently Asked Questions accordion shows on the product detail page.</p>
                                </div>
                            </div>

                            {formData.faqEnabled && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom FAQs</label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData(prev => ({ ...prev, faqs: [...(prev.faqs || []), { question: "", answer: "" }] }))}
                                            className="bg-[#c06b40]/10 border-[#c06b40]/30 text-[#c06b40] hover:bg-[#c06b40] hover:text-white transition-all text-xs h-8"
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add FAQ
                                        </Button>
                                    </div>

                                    {(!formData.faqs || formData.faqs.length === 0) ? (
                                        <p className="text-xs text-gray-500 italic text-center py-4 bg-white/1 rounded-xl border border-dashed border-white/5">
                                            No custom FAQs added. (Will fallback to standard system FAQs)
                                        </p>
                                    ) : (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                            {formData.faqs.map((faq: any, idx: number) => (
                                                <div key={idx} className="p-4 bg-white/1 border border-white/5 rounded-xl space-y-3 relative group">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Question #{idx + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, faqs: (prev.faqs || []).filter((_, i) => i !== idx) }));
                                                            }}
                                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <Input
                                                        placeholder="Question text..."
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...formData.faqs];
                                                            newFaqs[idx].question = e.target.value;
                                                            setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                                        }}
                                                        className="bg-black border-white/10 h-10 text-sm"
                                                    />
                                                    <textarea
                                                        placeholder="Answer text..."
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...formData.faqs];
                                                            newFaqs[idx].answer = e.target.value;
                                                            setFormData(prev => ({ ...prev, faqs: newFaqs }));
                                                        }}
                                                        className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white h-20 focus:outline-none focus:border-[#c06b40] transition-colors resize-none text-xs"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
                <DialogContent className="max-w-3xl bg-[#0a0a0a] border-white/10 p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Market Readiness Report</DialogTitle>
                        <DialogDescription>A final audit of your product listing quality and alignment.</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-[#c06b40]" />
                                    Market Readiness Report
                                </h2>
                                <p className="text-sm text-gray-500">A final audit of your product listing quality and alignment.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-[#c06b40]">{analysis?.overall}%</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold">Overall Score</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnalysisSection
                                title="Alignment: Name & Story"
                                score={analysis?.nameDescScore ?? 0}
                                description="Measures how well your product description incorporates the product name."
                            />
                            <AnalysisSection
                                title="Alignment: SEO Title"
                                score={analysis?.seoTitleScore ?? 0}
                                description="Checks if your primary SEO title aligns with your product name."
                            />
                            <AnalysisSection
                                title="Alignment: Search Snippet"
                                score={analysis?.seoDescMatchScore ?? 0}
                                description="Analyzes if your meta description reflects the actual product content."
                            />
                            <AnalysisSection
                                title="Content Richness"
                                score={analysis?.seoRichness ?? 0}
                                description="Evaluates the depth and keyword density of your SEO meta-data."
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Expert Recommendations
                            </h4>
                            <ul className="space-y-2">
                                {(analysis?.overall ?? 0) < 80 && (
                                    <li className="text-sm text-gray-400 flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 shrink-0" />
                                        Your keywords are not perfectly aligned. Try to include words from your product name more naturally in your description.
                                    </li>
                                )}
                                {(analysis?.seoRichness ?? 0) < 70 && (
                                    <li className="text-sm text-gray-400 flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-yellow-500 mt-2 shrink-0" />
                                        SEO Description is brief. Aim for 120-150 characters for better search visibility.
                                    </li>
                                )}
                                {analysis?.overall === 100 && (
                                    <li className="text-sm text-green-500 flex items-start gap-2 italic">
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        This listing is perfectly optimized for search engines and user conversion.
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 bg-white/5 border-white/10 h-12 hover:text-blact hover:bg-white/10 text-white"
                                onClick={() => setShowAnalysis(false)}
                            >
                                Continue Editing
                            </Button>
                            <Button
                                className="flex-1 bg-[#c06b40] hover:bg-[#a05a35] h-12 gap-2 text-white font-bold"
                                onClick={confirmSave}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Persist Listing
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function AnalysisSection({ title, score, description }: { title: string, score: number, description: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                <span className={cn("text-sm font-bold", score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500")}>
                    {score}%
                </span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-700", score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500")}
                    style={{ width: `${score}%` }}
                />
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed italic">{description}</p>
        </div>
    );
}
