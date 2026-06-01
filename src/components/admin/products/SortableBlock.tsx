"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Settings2, Image as ImageIcon, Type, LayoutTemplate, Heading1, AlignLeft, Columns, LayoutGrid, MousePointerClick, Minus, ListPlus, ArrowUpDown, Plus as PlusIcon, Video } from "lucide-react";
import { ISection } from "@/types/models";
import { ImgBBUploader } from "./ImgBBUploader";
import { useState } from "react";

interface SortableBlockProps {
    id: string;
    section: ISection;
    onUpdate: (id: string, newSection: ISection) => void;
    onRemove: (id: string) => void;
}

export function SortableBlock({ id, section, onUpdate, onRemove }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    const [isExpanded, setIsExpanded] = useState(true);

    const updateData = (key: string, value: any) => {
        onUpdate(id, {
            ...section,
            data: {
                ...(section.data || {}),
                [key]: value
            }
        });
    };

    const renderHeroSettings = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Title</label>
                <input
                    value={section.data?.title || ''}
                    onChange={(e) => updateData('title', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm"
                    placeholder="E.g. The Ultimate Elixir"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Subtitle</label>
                <input
                    value={section.data?.subtitle || ''}
                    onChange={(e) => updateData('subtitle', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm"
                    placeholder="E.g. Discover pure elegance..."
                />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs text-gray-400">Background Image (Optional)</label>
                <ImgBBUploader
                    value={section.data?.imageUrl || ''}
                    onChange={(url) => updateData('imageUrl', url)}
                    label=""
                    className="h-32"
                />
            </div>
        </div>
    );

    const renderAboutSettings = () => (
        <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Section Title</label>
                <input
                    value={section.data?.title || ''}
                    onChange={(e) => updateData('title', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm"
                    placeholder="E.g. Product Details"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Description Text</label>
                <textarea
                    value={section.data?.description || ''}
                    onChange={(e) => updateData('description', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Step into a world of unparalleled opulence..."
                />
            </div>
        </div>
    );

    const renderKeyNotesSettings = () => {
        const paragraphs = section.data.paragraphs || ['', '', ''];
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="md:col-span-3 flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Section Title (Optional)</label>
                    <input
                        value={section.data?.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm w-full md:w-1/3"
                        placeholder="E.g. Key Notes"
                    />
                </div>
                {paragraphs.map((para: string, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 border border-white/5 bg-black/30 p-4 rounded-lg">
                        <label className="text-xs font-medium text-[#c06b40]">Column {idx + 1}</label>
                        <textarea
                            value={para}
                            onChange={(e) => {
                                const newParas = [...paragraphs];
                                newParas[idx] = e.target.value;
                                updateData('paragraphs', newParas);
                            }}
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm h-full min-h-[80px]"
                            placeholder={`Text for column ${idx + 1}...`}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderGallerySettings = () => {
        const images = section.data.images || [];
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2 md:w-1/3">
                    <label className="text-xs text-gray-400">Layout Style</label>
                    <select
                        value={section.data?.layoutStyle || 'grid'}
                        onChange={(e) => updateData('layoutStyle', e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm appearance-none"
                    >
                        <option value="grid">CSS Grid (Responsive square)</option>
                        <option value="carousel">Horizontal Slider (Carousel)</option>
                        <option value="masonry">Pinterest Masonry (Staggered)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {images.map((img: string, idx: number) => (
                        <div key={idx} className="relative group rounded-md overflow-hidden border border-white/10 aspect-square bg-black/50 flex flex-col">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                                onClick={() => {
                                    const newImgs = images.filter((_: any, i: number) => i !== idx);
                                    updateData('images', newImgs);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="aspect-square">
                        <ImgBBUploader
                            value={""}
                            onChange={(url) => {
                                updateData('images', [...images, url]);
                            }}
                            label=""
                            className="h-full w-full"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderVideoSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Section Title (Optional)</label>
                <input
                    value={section.data?.title || ''}
                    onChange={(e) => updateData('title', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm md:w-1/2"
                    placeholder="E.g. The Making of Luxurious Elixir"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Video Embed URL (YouTube or Vimeo Player Link)</label>
                <input
                    value={section.data?.videoUrl || ''}
                    onChange={(e) => updateData('videoUrl', e.target.value)}
                    className="bg-black/50 border border-[#c06b40]/30 rounded px-3 py-2 text-sm w-full font-mono text-blue-300"
                    placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                />
            </div>
        </div>
    );

    const renderRichTextSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Standard Text (Paragraphs or light HTML)</label>
                <textarea
                    value={section.data?.htmlContent || ''}
                    onChange={(e) => updateData('htmlContent', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-4 py-3 text-sm min-h-[200px] leading-relaxed"
                    placeholder="Write anything here. New lines will be respected..."
                />
            </div>
        </div>
    );

    // --- ELEMENTOR BLOCKS BATCH 1 ---

    const renderHeadingSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Heading Text</label>
                <input
                    value={section.data?.text || ''}
                    onChange={(e) => updateData('text', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm"
                    placeholder="E.g. The Pinnacle of Craftsmanship"
                />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Tag Level</label>
                    <select value={section.data.tag || 'h2'} onChange={(e) => updateData('tag', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Alignment</label>
                    <select value={section.data.alignment || 'left'} onChange={(e) => updateData('alignment', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Color (Tailwind or Hex)</label>
                    <input value={section.data.color || ''} onChange={(e) => updateData('color', e.target.value)} placeholder="text-white OR #FFFFFF" className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="flex flex-col gap-2 justify-end">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={section.data.isGradient || false} onChange={(e) => updateData('isGradient', e.target.checked)} className="rounded border-white/10 bg-black/50 text-[#c06b40]" />
                        Apply Gradient
                    </label>
                </div>
            </div>
        </div>
    );

    const renderParagraphSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Paragraph Content (Basic HTML allowed)</label>
                <textarea
                    value={section.data?.htmlContent || ''}
                    onChange={(e) => updateData('htmlContent', e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm min-h-[120px]"
                    placeholder="Enter your paragraph text here..."
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Alignment</label>
                    <select value={section.data.alignment || 'left'} onChange={(e) => updateData('alignment', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Text Size</label>
                    <select value={section.data.size || 'base'} onChange={(e) => updateData('size', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="sm">Small</option><option value="base">Normal</option><option value="lg">Large</option><option value="xl">Extra Large</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Color Variant</label>
                    <input value={section.data.textColor || ''} onChange={(e) => updateData('textColor', e.target.value)} placeholder="text-gray-400" className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                </div>
            </div>
        </div>
    );

    const renderBannerSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Background Image</label>
                    <ImgBBUploader value={section.data.bgImageUrl || ''} onChange={(url) => updateData('bgImageUrl', url)} mini />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Title</label>
                        <input value={section.data.title || ''} onChange={(e) => updateData('title', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Subtitle</label>
                        <input value={section.data.subtitle || ''} onChange={(e) => updateData('subtitle', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Button Text</label>
                            <input value={section.data.buttonText || ''} onChange={(e) => updateData('buttonText', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Button Link</label>
                            <input value={section.data.buttonLink || ''} onChange={(e) => updateData('buttonLink', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Height</label>
                            <select value={section.data.height || 'md'} onChange={(e) => updateData('height', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                                <option value="sm">Small (Thin)</option><option value="md">Medium</option><option value="lg">Large</option><option value="screen">Full Screen</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Overlay Opacity (0-100)</label>
                            <input type="number" min="0" max="100" value={section.data.overlayOpacity ?? 60} onChange={(e) => updateData('overlayOpacity', Number(e.target.value))} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Text Align</label>
                            <select value={section.data.textAlignment || 'center'} onChange={(e) => updateData('textAlignment', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSplitContentSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Media Type</label>
                        <select value={section.data.mediaType || 'image'} onChange={(e) => updateData('mediaType', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                            <option value="image">Image</option><option value="video">Video</option>
                        </select>
                    </div>
                    {section.data.mediaType === 'video' ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">Video Embed URL</label>
                            <input value={section.data.mediaUrl || ''} onChange={(e) => updateData('mediaUrl', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">Media Image</label>
                            <ImgBBUploader value={section.data.mediaUrl || ''} onChange={(url) => updateData('mediaUrl', url)} mini />
                        </div>
                    )}
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Layout</label>
                            <select value={section.data.layout || 'mediaLeft'} onChange={(e) => updateData('layout', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                                <option value="mediaLeft">Media Left</option><option value="mediaRight">Media Right</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Ratio</label>
                            <select value={section.data.ratio || '50/50'} onChange={(e) => updateData('ratio', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                                <option value="50/50">50 / 50</option><option value="40/60">40 / 60</option><option value="60/40">60 / 40</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Title</label>
                        <input value={section.data.title || ''} onChange={(e) => updateData('title', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Body Content (HTML allowed)</label>
                        <textarea value={section.data.htmlContent || ''} onChange={(e) => updateData('htmlContent', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm min-h-[100px]" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Button Text</label>
                            <input value={section.data.buttonText || ''} onChange={(e) => updateData('buttonText', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-xs text-gray-400">Button Link</label>
                            <input value={section.data.buttonLink || ''} onChange={(e) => updateData('buttonLink', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSpacerSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2 md:w-1/3">
                <label className="text-xs text-gray-400">Spacer Height (px)</label>
                <input
                    type="number"
                    min="0"
                    value={section.data.height ?? 64}
                    onChange={(e) => updateData('height', Number(e.target.value))}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm"
                />
            </div>
        </div>
    );

    // --- ELEMENTOR BLOCKS BATCH 2 ---

    const renderFeatureGridSettings = () => {
        const features = section.data.features || [{ title: '', description: '', iconUrl: '' }];
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs text-gray-400">Section Title (Optional)</label>
                        <input value={section.data.title || ''} onChange={(e) => updateData('title', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs text-gray-400">Columns Layout</label>
                        <select value={section.data.columns || 3} onChange={(e) => updateData('columns', Number(e.target.value))} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                            <option value="2">2 Columns</option><option value="3">3 Columns</option><option value="4">4 Columns</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-3 border border-white/10 rounded-lg p-4 bg-black/20">
                    <label className="text-xs text-[#c06b40] font-medium flex justify-between">Features List
                        <button type="button" onClick={() => updateData('features', [...features, { title: '', description: '', iconUrl: '' }])} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><PlusIcon className="w-3 h-3" /> Add</button>
                    </label>
                    {features.map((feat: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-3">
                            <div className="w-16 h-16 shrink-0 bg-black/40 border border-white/10 overflow-hidden relative group">
                                {feat.iconUrl ? <img src={feat.iconUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xs text-gray-500">Icon</div>}
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImgBBUploader mini value="" onChange={(url) => { const f = [...features]; f[idx].iconUrl = url; updateData('features', f); }} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <input value={feat.title} onChange={(e) => { const f = [...features]; f[idx].title = e.target.value; updateData('features', f); }} placeholder="Feature Title" className="bg-black/50 border border-white/10 rounded px-3 py-1 text-sm font-medium text-white" />
                                <textarea value={feat.description} onChange={(e) => { const f = [...features]; f[idx].description = e.target.value; updateData('features', f); }} placeholder="Short description..." className="bg-black/50 border border-white/10 rounded px-3 py-1 text-xs min-h-[50px] text-gray-400" />
                            </div>
                            <button type="button" onClick={() => updateData('features', features.filter((_: any, i: number) => i !== idx))} className="mt-1 text-red-500 hover:bg-red-500/10 p-1 rounded"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderButtonSettings = () => (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs text-gray-400">Button Text</label>
                    <input value={section.data.text || ''} onChange={(e) => updateData('text', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs text-gray-400">Target Link URL</label>
                    <input value={section.data.link || ''} onChange={(e) => updateData('link', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Style Variant</label>
                    <select value={section.data.style || 'primary'} onChange={(e) => updateData('style', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="primary">Primary (Filled)</option><option value="secondary">Secondary</option><option value="outline">Outline</option><option value="ghost">Ghost (Text Only)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Size</label>
                    <select value={section.data.size || 'default'} onChange={(e) => updateData('size', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="sm">Small</option><option value="default">Default</option><option value="lg">Large</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Alignment</label>
                    <select value={section.data.alignment || 'left'} onChange={(e) => updateData('alignment', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                        <option value="left">Left Align</option><option value="center">Center Align</option><option value="right">Right Align</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderDividerSettings = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Line Style</label>
                <select value={section.data.style || 'solid'} onChange={(e) => updateData('style', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                    <option value="solid">Solid Line</option><option value="dashed">Dashed Line</option><option value="dotted">Dotted Line</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Thickness (px)</label>
                <input type="number" min="1" max="10" value={section.data.thickness || 1} onChange={(e) => updateData('thickness', Number(e.target.value))} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Color (Tailwind/Hex)</label>
                <input value={section.data.color || ''} onChange={(e) => updateData('color', e.target.value)} placeholder="border-white/10" className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400">Vertical Margin</label>
                <select value={section.data.margin || 'my-8'} onChange={(e) => updateData('margin', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm">
                    <option value="my-4">Small</option><option value="my-8">Medium</option><option value="my-16">Large</option><option value="my-24">Extra Large</option>
                </select>
            </div>
        </div>
    );

    const renderAccordionSettings = () => {
        const items = section.data.items || [{ title: '', content: '' }];
        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2 md:w-1/2">
                    <label className="text-xs text-gray-400">Accordion Group Title (Optional)</label>
                    <input value={section.data.title || ''} onChange={(e) => updateData('title', e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm" placeholder="Frequently Asked Questions" />
                </div>
                <div className="flex flex-col gap-3 border border-white/10 rounded-lg p-4 bg-black/20">
                    <label className="text-xs text-[#c06b40] font-medium flex justify-between">Collapsible Items
                        <button type="button" onClick={() => updateData('items', [...items, { title: '', content: '' }])} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><PlusIcon className="w-3 h-3" /> Add</button>
                    </label>
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-3">
                            <span className="text-xs text-gray-500 font-mono mt-2">{idx + 1}.</span>
                            <div className="flex flex-col gap-2 flex-1">
                                <input value={item.title} onChange={(e) => { const f = [...items]; f[idx].title = e.target.value; updateData('items', f); }} placeholder="Question / Title" className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm font-medium text-white" />
                                <textarea value={item.content} onChange={(e) => { const f = [...items]; f[idx].content = e.target.value; updateData('items', f); }} placeholder="Answer / Content (HTML allowed)..." className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm min-h-[60px] text-gray-300" />
                            </div>
                            <button type="button" onClick={() => updateData('items', items.filter((_: any, i: number) => i !== idx))} className="mt-1 text-red-500 hover:bg-red-500/10 p-1 rounded"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getBlockIcon = () => {
        switch (section.type) {
            case 'hero': return <LayoutTemplate className="w-4 h-4 text-blue-400" />;
            case 'about': return <Type className="w-4 h-4 text-emerald-400" />;
            case 'values': return <GripVertical className="w-4 h-4 text-[#c06b40]" />;
            case 'heading': return <Heading1 className="w-4 h-4 text-blue-400" />;
            case 'paragraph': return <AlignLeft className="w-4 h-4 text-gray-400" />;
            case 'rich_text': return <Type className="w-4 h-4 text-yellow-500" />;
            case 'banner': return <LayoutTemplate className="w-4 h-4 text-indigo-400" />;
            case 'split_content': return <Columns className="w-4 h-4 text-emerald-400" />;
            case 'feature_grid': return <LayoutGrid className="w-4 h-4 text-[#c06b40]" />;
            case 'spacer': return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
            case 'divider': return <Minus className="w-4 h-4 text-gray-400" />;
            case 'image_gallery': return <ImageIcon className="w-4 h-4 text-purple-400" />;
            case 'video_embed': return <Settings2 className="w-4 h-4 text-red-500" />;
            case 'button': return <MousePointerClick className="w-4 h-4 text-pink-400" />;
            case 'accordion': return <ListPlus className="w-4 h-4 text-cyan-400" />;
            default: return <Settings2 className="w-4 h-4 text-gray-400" />;
        }
    };

    const getBlockTitle = () => {
        switch (section.type) {
            case 'hero': return 'Hero / Feature Header';
            case 'about': return 'About Text Block';
            case 'values': return 'Key Notes Columns (3)';
            case 'heading': return 'Heading Text';
            case 'paragraph': return 'Paragraph Text';
            case 'rich_text': return 'Rich HTML Text';
            case 'banner': return 'Banner Layout';
            case 'split_content': return 'Split Content Layout';
            case 'feature_grid': return 'Grid of Features';
            case 'spacer': return 'Spacer / Whitespace';
            case 'divider': return 'Horizontal Divider';
            case 'image_gallery': return 'Image Gallery';
            case 'video_embed': return 'Video Player';
            case 'button': return 'Call to Action Button';
            case 'accordion': return 'Accordion FAQ List';
            default: return 'Unknown Block';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col bg-[#161616] border transition-all rounded-xl overflow-hidden
                ${isDragging ? 'border-[#c06b40] shadow-2xl scale-[1.02] opacity-80' : 'border-white/10 hover:border-white/20'}
            `}
        >
            {/* Header Bar */}
            <div className="flex items-center justify-between p-3 bg-black/40 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white transition-colors"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {getBlockIcon()}
                        <span className="font-medium text-sm text-gray-200">{getBlockTitle()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white bg-white/5 rounded transition-colors"
                    >
                        {isExpanded ? 'Collapse' : 'Edit'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onRemove(id)}
                        className="p-1.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expander Content */}
            {isExpanded && (
                <div className="p-5">
                    {section.type === 'hero' && renderHeroSettings()}
                    {section.type === 'about' && renderAboutSettings()}
                    {section.type === 'values' && renderKeyNotesSettings()}
                    {section.type === 'image_gallery' && renderGallerySettings()}
                    {section.type === 'video_embed' && renderVideoSettings()}
                    {section.type === 'rich_text' && renderRichTextSettings()}
                    {section.type === 'heading' && renderHeadingSettings()}
                    {section.type === 'paragraph' && renderParagraphSettings()}
                    {section.type === 'banner' && renderBannerSettings()}
                    {section.type === 'split_content' && renderSplitContentSettings()}
                    {section.type === 'spacer' && renderSpacerSettings()}
                    {section.type === 'feature_grid' && renderFeatureGridSettings()}
                    {section.type === 'button' && renderButtonSettings()}
                    {section.type === 'divider' && renderDividerSettings()}
                    {section.type === 'accordion' && renderAccordionSettings()}
                </div>
            )}
        </div>
    );
}
