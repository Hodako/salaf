"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpTooltip, FormFieldLabel } from "./FormHelpers";
import { ImgBBUploader } from "./ImgBBUploader";

export interface IVariation {
    volume: string;
    volumeUnit: string;
    basePrice: string;
    salePrice: string;
    stock?: number | string;
    sku?: string;
    image?: string;
    variantType?: string;
}

interface VariationManagerProps {
    variations: IVariation[];
    onChange: (variations: IVariation[]) => void;
}

export function VariationManager({ variations, onChange }: VariationManagerProps) {
    const addVariation = () => {
        onChange([
            ...variations,
            { volume: "", volumeUnit: "g", basePrice: "", salePrice: "", stock: "10", image: "", variantType: "" }
        ]);
    };

    const removeVariation = (index: number) => {
        onChange(variations.filter((_, i) => i !== index));
    };

    const updateVariation = (index: number, field: keyof IVariation, value: any) => {
        // Prevention of same volume for 2 variants
        if (field === 'volume') {
            const isDuplicate = variations.some((v, i) => i !== index && v.volume === value && v.volumeUnit === variations[index].volumeUnit);
            if (isDuplicate && value !== "") {
                return;
            }
        }
        if (field === 'volumeUnit') {
            const isDuplicate = variations.some((v, i) => i !== index && v.volume === variations[index].volume && v.volumeUnit === value);
            if (isDuplicate) return;
        }

        const newVariations = [...variations];
        newVariations[index] = { ...newVariations[index], [field]: value };
        onChange(newVariations);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                        Product Variations
                        <HelpTooltip content="Define different sizes, weights, or quantities for this product. Each variation will have its own unique SKU automatically generated based on the SKU Prefix and Volume." />
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1 italic leading-relaxed">
                        Add weights or volumes like 500g, 1kg, 250ml, etc. <br/>
                        <span className="text-[#c06b40]/80">Note: SKU is generated automatically based on your Prefix + Volume.</span>
                    </p>
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addVariation}
                    className="bg-[#c06b40]/10 border-[#c06b40]/30 text-[#c06b40] hover:bg-[#c06b40] hover:text-white transition-all text-[11px] font-bold h-8"
                >
                    <Plus className="w-3 h-3 mr-1" /> ADD VARIANTS
                </Button>
            </div>

            {variations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-500">No variations added yet. Add at least one variant.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {variations.map((v, idx) => (
                        <div key={idx} className="bg-black border border-white/10 rounded-xl p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variant #{idx + 1}</span>
                                <button 
                                    type="button" 
                                    onClick={() => removeVariation(idx)}
                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <FormFieldLabel label="Weight/Size & Unit" tooltip="Enter the amount and select unit (e.g. 500 g)." />
                                    <div className="flex gap-1">
                                        <Input
                                            value={v.volume}
                                            onChange={(e) => updateVariation(idx, 'volume', e.target.value)}
                                            placeholder="500"
                                            className="bg-zinc-900 border-white/5 h-9"
                                        />
                                        <select
                                            value={v.volumeUnit}
                                            onChange={(e) => updateVariation(idx, 'volumeUnit', e.target.value)}
                                            className="bg-zinc-900 border border-white/5 rounded-md text-sm px-2 text-white h-9 outline-none focus:border-[#c06b40] transition-all appearance-none min-w-[65px]"
                                        >
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                            <option value="ml">ml</option>
                                            <option value="l">l</option>
                                            <option value="pcs">pcs</option>
                                            <option value="pack">pack</option>
                                            <option value="box">box</option>
                                            <option value="set">set</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 flex-1">
                                    <FormFieldLabel label="Base Price (৳)" tooltip="Original selling price before any discounts." />
                                    <Input
                                        type="number"
                                        value={v.basePrice}
                                        onChange={(e) => updateVariation(idx, 'basePrice', e.target.value)}
                                        placeholder="0.00"
                                        className="bg-zinc-900 border-white/5 h-9"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 flex-1">
                                    <FormFieldLabel label="Sale Price (৳)" tooltip="Optional promotional price. If set, this will be displayed as the primary price with the base price struck through." />
                                    <Input
                                        type="number"
                                        value={v.salePrice}
                                        onChange={(e) => updateVariation(idx, 'salePrice', e.target.value)}
                                        placeholder="Optional"
                                        className="bg-zinc-900 border-white/5 h-9"
                                    />
                                    <p className="text-[9px] text-gray-500 italic ml-1">Leave blank to disable discount.</p>
                                </div>

                                <div className="flex flex-col gap-1.5 flex-1">
                                    <FormFieldLabel label="Stock Quantity" tooltip="Available inventory for this variant." />
                                    <Input
                                        type="number"
                                        value={v.stock !== undefined ? v.stock.toString() : "10"}
                                        onChange={(e) => updateVariation(idx, 'stock', e.target.value)}
                                        placeholder="10"
                                        className="bg-zinc-900 border-white/5 h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                <div className="flex flex-col gap-1.5">
                                    <FormFieldLabel label="Variant Type (Optional)" tooltip="e.g. 'Standard', 'Premium Quality'. Leave blank if not applicable." />
                                    <Input
                                        value={v.variantType}
                                        onChange={(e) => updateVariation(idx, 'variantType', e.target.value)}
                                        placeholder="e.g. Premium"
                                        className="bg-zinc-900 border-white/5 h-9"
                                    />
                                    <p className="text-[9px] text-gray-500 italic ml-1">Shown in UI as: {v.volume} {v.volumeUnit} ({v.variantType || "..."})</p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <FormFieldLabel label="Variant Image (Optional)" tooltip="Specific image for this variant. If left blank, the product's featured image will be used." />
                                    <ImgBBUploader
                                        mini
                                        value={v.image || ""}
                                        onChange={(url) => updateVariation(idx, 'image', url)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
