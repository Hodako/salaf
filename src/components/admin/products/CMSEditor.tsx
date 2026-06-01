"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ISection } from "@/types/models";
import { SortableBlock } from "./SortableBlock";
import { Plus, LayoutTemplate, Type, Image as ImageIcon, Heading1, AlignLeft, GripHorizontal, Columns, LayoutGrid, MousePointerClick, Minus, ListPlus, ArrowUpDown, Video } from "lucide-react";

interface CMSEditorProps {
    sections: ISection[];
    onChange: (sections: ISection[]) => void;
}

export function CMSEditor({ sections, onChange }: CMSEditorProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s: any) => s._clientId === active.id);
            const newIndex = sections.findIndex((s: any) => s._clientId === over.id);
            onChange(arrayMove(sections, oldIndex, newIndex));
        }
    };

    const addBlock = (type: ISection['type']) => {
        const newBlock = {
            _clientId: Math.random().toString(36).substr(2, 9), // Temporary ID for DND tracking
            type,
            data: {}
        };
        onChange([...sections, newBlock as any]);
    };

    const updateBlock = (id: string, newSection: ISection) => {
        onChange(sections.map((s: any) => s._clientId === id ? newSection : s));
    };

    const removeBlock = (id: string) => {
        onChange(sections.filter((s: any) => s._clientId !== id));
    };

    const [activeTab, setActiveTab] = useState<'typography' | 'layout' | 'media' | 'components' | 'legacy'>('typography');

    return (
        <div className="flex flex-col gap-6">

            {/* Block Adder Toolbar - Categorized */}
            <div className="flex flex-col gap-4 p-4 bg-[#c06b40]/5 border border-[#c06b40]/20 rounded-xl border-dashed">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#c06b40]/10 flex items-center justify-center shrink-0">
                        <LayoutTemplate className="w-4 h-4 text-[#c06b40]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-[#c06b40] uppercase tracking-wider">Visual Page Builder</h3>
                        <p className="text-[10px] text-gray-500 italic">Drag and drop blocks to build a rich story for your perfume.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <span className="text-sm text-gray-400 font-medium mr-2">Add Block:</span>
                    {(['typography', 'layout', 'media', 'components', 'legacy'] as const).map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === tab ? 'bg-[#c06b40] text-white' : 'bg-white/5 text-gray-400 hover:text-gray-200'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {activeTab === 'typography' && (
                        <>
                            <button type="button" onClick={() => addBlock('heading')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Heading1 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> Heading
                            </button>
                            <button type="button" onClick={() => addBlock('paragraph')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <AlignLeft className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" /> Paragraph
                            </button>
                            <button type="button" onClick={() => addBlock('rich_text')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Type className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" /> Clean HTML/Rich Text
                            </button>
                        </>
                    )}

                    {activeTab === 'layout' && (
                        <>
                            <button type="button" onClick={() => addBlock('banner')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <LayoutTemplate className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> Banner
                            </button>
                            <button type="button" onClick={() => addBlock('split_content')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Columns className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> Split Content
                            </button>
                            <button type="button" onClick={() => addBlock('feature_grid')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <LayoutGrid className="w-4 h-4 text-[#c06b40] group-hover:scale-110 transition-transform" /> Feature Grid
                            </button>
                            <button type="button" onClick={() => addBlock('spacer')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <ArrowUpDown className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" /> Spacer
                            </button>
                            <button type="button" onClick={() => addBlock('divider')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Minus className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" /> Divider
                            </button>
                        </>
                    )}

                    {activeTab === 'media' && (
                        <>
                            <button type="button" onClick={() => addBlock('image_gallery')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <ImageIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" /> Image Gallery
                            </button>
                            <button type="button" onClick={() => addBlock('video_embed')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Video className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" /> Video Embed
                            </button>
                        </>
                    )}

                    {activeTab === 'components' && (
                        <>
                            <button type="button" onClick={() => addBlock('button')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <MousePointerClick className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" /> Call To Action (Button)
                            </button>
                            <button type="button" onClick={() => addBlock('accordion')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <ListPlus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" /> Accordion (FAQ)
                            </button>
                        </>
                    )}

                    {activeTab === 'legacy' && (
                        <>
                            <button type="button" onClick={() => addBlock('hero')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <LayoutTemplate className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> Hero Banner
                            </button>
                            <button type="button" onClick={() => addBlock('about')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <Type className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> Legacy About
                            </button>
                            <button type="button" onClick={() => addBlock('values')} className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-white/10 hover:border-[#c06b40] rounded-lg text-sm transition-colors text-white group">
                                <GripHorizontal className="w-4 h-4 text-[#c06b40] group-hover:scale-110 transition-transform" /> Legacy Key Notes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* DND Editor Area */}
            {sections.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sections.map((s: any) => s._clientId)} strategy={verticalListSortingStrategy}>
                            {sections.map((section: any) => (
                                <SortableBlock
                                    key={section._clientId}
                                    id={section._clientId}
                                    section={section}
                                    onUpdate={updateBlock}
                                    onRemove={removeBlock}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            ) : (
                <div className="p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                    <LayoutTemplate className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
                    <p className="text-gray-300 font-medium">No layout blocks added yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Use the toolbar above to start visually building this product's page structure!</p>
                </div>
            )}

        </div>
    );
}
