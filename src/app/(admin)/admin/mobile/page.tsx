"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    Smartphone, 
    Save, 
    Loader2, 
    Plus, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Sparkles, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    Search, 
    FolderPlus,
    LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImgBBUploader } from "@/components/admin/products/ImgBBUploader";

interface HeroSlide {
    tagline: string;
    titleWhite: string;
    titleGold: string;
    description: string;
    imageUrl: string;
    mobileImageUrl: string;
    buttonText: string;
    buttonLink: string;
}

interface SpotlightSection {
    title: string;
    subtitle: string;
    productIds: string[];
}

export default function MobileAdminPage() {
    const queryClient = useQueryClient();
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [spotlightSections, setSpotlightSections] = useState<SpotlightSection[]>([]);
    
    // Search terms per spotlight section index: { [index]: "search_term" }
    const [sectionSearchTerms, setSectionSearchTerms] = useState<Record<number, string>>({});

    // Fetch settings
    const { data: settings, isLoading: isSettingsLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const { data } = await axios.get("/admin/settings");
            return data;
        }
    });

    // Fetch products
    const { data: products = [], isLoading: isProductsLoading } = useQuery({
        queryKey: ["admin-products-list"],
        queryFn: async () => {
            const { data } = await axios.get("/admin/products");
            return data;
        }
    });

    useEffect(() => {
        if (settings) {
            if (Array.isArray(settings.hero_slides)) {
                setHeroSlides(settings.hero_slides);
            }
            
            if (Array.isArray(settings.spotlight_sections)) {
                setSpotlightSections(settings.spotlight_sections);
            } else if (settings.spotlight_section) {
                // Fallback / Migrate from old single section setting
                setSpotlightSections([settings.spotlight_section]);
            } else {
                setSpotlightSections([]);
            }
        }
    }, [settings]);

    const mutation = useMutation({
        mutationFn: (data: any) => axios.post("/admin/settings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            toast.success("Mobile settings saved successfully");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update settings");
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        for (const slide of heroSlides) {
            if (!slide.imageUrl) {
                toast.error("All slides must have at least a desktop Image URL");
                return;
            }
        }

        const payload = {
            hero_slides: heroSlides,
            spotlight_sections: spotlightSections,
            // Preserve single section field for backward compatibility with older components
            spotlight_section: spotlightSections[0] || null
        };

        mutation.mutate(payload);
    };

    // Hero Slide Handlers
    const addSlide = () => {
        const newSlide: HeroSlide = {
            tagline: "NEW ARRIVAL",
            titleWhite: "DISCOVER THE PURE",
            titleGold: "TRADITION OF OUD",
            description: "EXPERIENCE NATURE'S EXQUISITE TREASURES METICULOUSLY CRAFTED INTO MASTERPIECES.",
            imageUrl: "",
            mobileImageUrl: "",
            buttonText: "SHOP NOW",
            buttonLink: "/shop"
        };
        setHeroSlides([...heroSlides, newSlide]);
        toast.info("New sliding banner form added");
    };

    const deleteSlide = (index: number) => {
        setHeroSlides(heroSlides.filter((_, idx) => idx !== index));
    };

    const moveSlide = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === heroSlides.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const updated = [...heroSlides];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setHeroSlides(updated);
    };

    const updateSlideField = (index: number, field: keyof HeroSlide, value: string) => {
        const updated = [...heroSlides];
        updated[index] = { ...updated[index], [field]: value };
        setHeroSlides(updated);
    };

    // Spotlight Section Handlers
    const addSpotlightSection = () => {
        const newSec: SpotlightSection = {
            title: "NEW SPOTLIGHT",
            subtitle: "FEATURED ITEMS",
            productIds: []
        };
        setSpotlightSections([...spotlightSections, newSec]);
        toast.info("New spotlight section added");
    };

    const deleteSpotlightSection = (secIndex: number) => {
        setSpotlightSections(spotlightSections.filter((_, idx) => idx !== secIndex));
        const updatedSearches = { ...sectionSearchTerms };
        delete updatedSearches[secIndex];
        setSectionSearchTerms(updatedSearches);
    };

    const moveSpotlightSection = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === spotlightSections.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const updated = [...spotlightSections];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setSpotlightSections(updated);
    };

    const updateSectionInfo = (secIndex: number, field: "title" | "subtitle", value: string) => {
        const updated = [...spotlightSections];
        updated[secIndex] = { ...updated[secIndex], [field]: value };
        setSpotlightSections(updated);
    };

    const toggleProductForSection = (secIndex: number, productId: string) => {
        const updated = [...spotlightSections];
        const currentIds = updated[secIndex].productIds || [];
        if (currentIds.includes(productId)) {
            updated[secIndex].productIds = currentIds.filter(id => id !== productId);
        } else {
            updated[secIndex].productIds = [...currentIds, productId];
        }
        setSpotlightSections(updated);
    };

    const handleSearchChange = (secIndex: number, term: string) => {
        setSectionSearchTerms({
            ...sectionSearchTerms,
            [secIndex]: term
        });
    };

    if (isSettingsLoading || isProductsLoading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-bprimary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-medium text-white mb-2">
                        Mobile & <span className="text-bprimary">Homepage Layout</span>
                    </h1>
                    <p className="text-gray-500">Configure sliding hero banners and select spotlight products.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={mutation.isPending}
                    className="bg-bprimary text-black font-bold uppercase tracking-widest rounded-2xl px-8 h-14 hover:scale-105 transition-all shadow-2xl shadow-bprimary/20 shrink-0"
                >
                    {mutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Changes
                </Button>
            </header>

            <div className="space-y-12">
                
                {/* 1. Hero Sliding Banners Section */}
                <div className="bg-white/3 rounded-[2rem] p-6 sm:p-8 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-bprimary/10 border border-bprimary/20 flex items-center justify-center text-bprimary shadow-inner">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg text-white font-medium">Hero Sliding Banners</h3>
                                <p className="text-xs text-gray-500">Configure landing page slides. Double click to customize images or buttons.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {heroSlides.map((slide, idx) => (
                            <div 
                                key={idx} 
                                className="bg-black/25 rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-all relative group"
                            >
                                {/* Header Actions */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <span className="text-xs font-bold text-[#AC8717] bg-[#AC8717]/10 px-3 py-1 rounded-full">
                                        Banner #{idx + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => moveSlide(idx, "up")}
                                            disabled={idx === 0}
                                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => moveSlide(idx, "down")}
                                            disabled={idx === heroSlides.length - 1}
                                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => deleteSlide(idx)}
                                            className="w-8 h-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Tagline</label>
                                        <Input 
                                            value={slide.tagline || ""} 
                                            onChange={(e) => updateSlideField(idx, "tagline", e.target.value)}
                                            className="bg-black/30 border-white/10 h-10 rounded-xl text-xs"
                                            placeholder="e.g. SALAF SCENTS"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Button Text</label>
                                        <Input 
                                            value={slide.buttonText || ""} 
                                            onChange={(e) => updateSlideField(idx, "buttonText", e.target.value)}
                                            className="bg-black/30 border-white/10 h-10 rounded-xl text-xs"
                                            placeholder="e.g. SHOP NOW"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Title (White Text)</label>
                                        <Input 
                                            value={slide.titleWhite || ""} 
                                            onChange={(e) => updateSlideField(idx, "titleWhite", e.target.value)}
                                            className="bg-black/30 border-white/10 h-10 rounded-xl text-xs"
                                            placeholder="e.g. PROVIDES THE BEST"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Title (Gold Text)</label>
                                        <Input 
                                            value={slide.titleGold || ""} 
                                            onChange={(e) => updateSlideField(idx, "titleGold", e.target.value)}
                                            className="bg-black/30 border-white/10 h-10 rounded-xl text-xs text-bprimary font-medium"
                                            placeholder="e.g. CUSTOMER SERVICE"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1">Description</label>
                                        <Textarea 
                                            value={slide.description || ""} 
                                            onChange={(e) => updateSlideField(idx, "description", e.target.value)}
                                            className="bg-black/30 border-white/10 rounded-xl min-h-[50px] resize-none text-xs"
                                            placeholder="Slide details..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1 flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Desktop Image
                                        </label>
                                        <ImgBBUploader 
                                            value={slide.imageUrl || ""} 
                                            onChange={(val) => updateSlideField(idx, "imageUrl", val)}
                                            className="mt-1"
                                        />
                                        <Input 
                                            value={slide.imageUrl || ""} 
                                            onChange={(e) => updateSlideField(idx, "imageUrl", e.target.value)}
                                            className="bg-black/30 border-white/10 h-8 rounded-lg text-[10px] mt-1.5"
                                            placeholder="Or paste custom image path/URL..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1 flex items-center gap-1">
                                            <Smartphone className="w-3 h-3" /> Mobile Image (Optional)
                                        </label>
                                        <ImgBBUploader 
                                            value={slide.mobileImageUrl || ""} 
                                            onChange={(val) => updateSlideField(idx, "mobileImageUrl", val)}
                                            className="mt-1"
                                        />
                                        <Input 
                                            value={slide.mobileImageUrl || ""} 
                                            onChange={(e) => updateSlideField(idx, "mobileImageUrl", e.target.value)}
                                            className="bg-black/30 border-white/10 h-8 rounded-lg text-[10px] mt-1.5"
                                            placeholder="Uses desktop image if blank"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500 ml-1 flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" /> Action Link Path
                                        </label>
                                        <Input 
                                            value={slide.buttonLink || ""} 
                                            onChange={(e) => updateSlideField(idx, "buttonLink", e.target.value)}
                                            className="bg-black/30 border-white/10 h-10 rounded-xl text-xs"
                                            placeholder="e.g. /shop"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Visual Add Card for Banners */}
                        <button
                            type="button"
                            onClick={addSlide}
                            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-bprimary/40 rounded-2xl bg-black/10 hover:bg-black/20 text-gray-500 hover:text-bprimary p-12 min-h-[300px] transition-all duration-300 group cursor-pointer"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/2 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-bprimary/10 transition-all">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest">Add New Banner</span>
                            <p className="text-xs text-gray-600 mt-1">Insert another dynamic sliding image layout.</p>
                        </button>
                    </div>
                </div>

                {/* 2. Spotlight Sections Editor */}
                <div className="bg-white/3 rounded-[2rem] p-6 sm:p-8 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#AC8717]/10 border border-[#AC8717]/20 flex items-center justify-center text-[#AC8717] shadow-inner">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg text-white font-medium">Spotlight Sections</h3>
                            <p className="text-xs text-gray-500">Configure spotlight rows which are scrollable horizontally on mobile and shown as a premium grid on desktop.</p>
                        </div>
                    </div>

                    {spotlightSections.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl">
                            No spotlight sections configured. Click "Add New Spotlight Section" below.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {spotlightSections.map((section, secIdx) => {
                                const searchVal = sectionSearchTerms[secIdx] || "";
                                const selectedCount = (section.productIds || []).length;
                                
                                // Filter products per section search bar
                                const filteredProducts = products.filter((product: any) => 
                                    product.name.toLowerCase().includes(searchVal.toLowerCase()) ||
                                    product.skuPrefix?.toLowerCase().includes(searchVal.toLowerCase())
                                );

                                return (
                                    <div 
                                        key={secIdx} 
                                        className="bg-black/20 rounded-[2rem] p-6 border border-white/5 space-y-6 hover:border-white/10 transition-all relative"
                                    >
                                        {/* Action Bar */}
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <span className="text-xs font-bold text-[#AC8717] bg-[#AC8717]/10 px-4 py-1.5 rounded-full">
                                                Spotlight Row #{secIdx + 1}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    onClick={() => moveSpotlightSection(secIdx, "up")}
                                                    disabled={secIdx === 0}
                                                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    onClick={() => moveSpotlightSection(secIdx, "down")}
                                                    disabled={secIdx === spotlightSections.length - 1}
                                                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    onClick={() => deleteSpotlightSection(secIdx)}
                                                    className="w-8 h-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            
                                            {/* Column 1: Info (Left) */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Kicker / Subtitle</label>
                                                    <Input 
                                                        value={section.subtitle || ""} 
                                                        onChange={(e) => updateSectionInfo(secIdx, "subtitle", e.target.value)}
                                                        className="bg-black/30 border-white/10 h-11 rounded-xl"
                                                        placeholder="e.g. EXCLUSIVE ACCESS"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Title</label>
                                                    <Input 
                                                        value={section.title || ""} 
                                                        onChange={(e) => updateSectionInfo(secIdx, "title", e.target.value)}
                                                        className="bg-black/30 border-white/10 h-11 rounded-xl font-medium"
                                                        placeholder="e.g. PRODUCT SPOTLIGHT"
                                                    />
                                                </div>
                                                
                                                <div className="bg-white/2 rounded-xl p-4 border border-white/5 space-y-2">
                                                    <h4 className="text-xs text-white font-semibold flex items-center gap-2">
                                                        <LayoutGrid className="w-4 h-4 text-bprimary" /> Selected Summary
                                                    </h4>
                                                    <p className="text-[11px] text-gray-400">
                                                        This row currently contains <strong className="text-white">{selectedCount}</strong> product{selectedCount !== 1 && "s"}.
                                                    </p>
                                                    {selectedCount === 0 && (
                                                        <p className="text-[10px] text-red-400 italic">Please select at least one product below to make it display.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Column 2 & 3: Product Selector */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                                                        Select Products for this section
                                                    </label>
                                                    {selectedCount > 0 && (
                                                        <button 
                                                            onClick={() => {
                                                                const updated = [...spotlightSections];
                                                                updated[secIdx].productIds = [];
                                                                setSpotlightSections(updated);
                                                            }}
                                                            className="text-[10px] uppercase font-black text-red-400 hover:text-red-300"
                                                        >
                                                            Clear Row
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Search */}
                                                <div className="relative">
                                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <Input 
                                                        value={searchVal}
                                                        onChange={(e) => handleSearchChange(secIdx, e.target.value)}
                                                        className="bg-black/30 border-white/10 h-11 pl-10 rounded-xl text-xs"
                                                        placeholder="Filter products..."
                                                    />
                                                </div>

                                                {/* Checklist */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto border border-white/5 rounded-xl bg-black/20 p-3 scrollbar-thin">
                                                    {filteredProducts.length === 0 ? (
                                                        <div className="col-span-2 text-center py-8 text-xs text-gray-500">
                                                            No products found.
                                                        </div>
                                                    ) : (
                                                        filteredProducts.map((product: any) => {
                                                            const isSelected = (section.productIds || []).includes(product._id);
                                                            return (
                                                                <button
                                                                    key={product._id}
                                                                    onClick={() => toggleProductForSection(secIdx, product._id)}
                                                                    className={`flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                                                                        isSelected 
                                                                            ? "bg-[#AC8717]/10 border border-[#AC8717]/30 text-white font-medium" 
                                                                            : "bg-white/2 hover:bg-white/5 border border-transparent text-gray-400"
                                                                    }`}
                                                                >
                                                                    <div className="truncate pr-2">
                                                                        <p className="font-semibold truncate">{product.name}</p>
                                                                        <p className="text-[9px] text-gray-500">{product.skuPrefix || "No SKU"}</p>
                                                                    </div>
                                                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                                                        isSelected 
                                                                            ? "bg-[#AC8717] border-[#AC8717] text-black" 
                                                                            : "border-white/15"
                                                                    }`}>
                                                                        {isSelected && "✓"}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Visual Add Card for Spotlight Sections */}
                    <button
                        type="button"
                        onClick={addSpotlightSection}
                        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#AC8717]/40 rounded-3xl bg-black/10 hover:bg-black/25 text-gray-500 hover:text-[#AC8717] p-12 transition-all duration-300 group cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/2 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#AC8717]/10 transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Add New Spotlight Section</span>
                        <p className="text-xs text-gray-600 mt-1">Insert another product spotlight grid/slider block onto the homepage.</p>
                    </button>
                </div>

            </div>
        </div>
    );
}
