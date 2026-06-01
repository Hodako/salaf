"use client";

import { useEffect, useState, useRef } from "react";
import GjsEditor, { Canvas } from "@grapesjs/react";
import grapesjs, { Editor } from "grapesjs";
import webpagePlugin from "grapesjs-preset-webpage";
import basicBlocks from "grapesjs-blocks-basic";
import { Save, ArrowLeft, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import 'grapesjs/dist/css/grapes.min.css';

interface PageEditorProps {
    initialData: any;
    onSave: (html: string, css: string, meta: any) => Promise<void>;
    onClose: () => void;
}

/**
 * A specialized CMS editor for pages and templates using GrapesJS.
 * 
 * Provides a drag-and-drop interface for building pages with custom blocks 
 * (Storefront Widgets, Premium Layouts). Handles page metadata (title, slug, SEO) 
 * and persistence via a save callback.
 * 
 * @param props - The component props including initial page data and callbacks.
 */
export function PageEditor({ initialData, onSave, onClose }: PageEditorProps) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Maintain meta states
    const [title, setTitle] = useState(initialData.title || "");
    const [slug, setSlug] = useState(initialData.slug || "");
    const [status, setStatus] = useState(initialData.status || "draft");
    const [isHome, setIsHome] = useState(initialData.isHome || false);
    const [seoTitle, setSeoTitle] = useState(initialData.seo?.title || "");
    const [seoDesc, setSeoDesc] = useState(initialData.seo?.description || "");
    const [showSettings, setShowSettings] = useState(false);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        const forbidden = [
            '/collections/', 'collections/',
            '/brands/', 'brands/',
            '/shop/', 'shop/', 'shop'
        ];
        forbidden.forEach(str => {
            val = val.split(str).join('');
        });
        setSlug(val);
    };

    const handleSave = async () => {
        if (!editor) return;
        try {
            setIsSaving(true);
            const html = editor.getHtml() ?? '';
            const css = editor.getCss() ?? '';

            await onSave(html, css, {
                title, slug, status, isHome,
                seo: { title: seoTitle ?? '', description: seoDesc ?? '' }
            });
            toast.success("Page saved successfully!");
        } catch (error) {
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const customDynamicWidgetsPlugin = (editor: Editor) => {
        // --- Custom Traits ---
        editor.TraitManager.addType('multi-checkbox', {
            // @ts-ignore
            createInput({ trait }) {
                // Wrapper relative
                const el = document.createElement('div');
                el.className = 'w-full mt-1';

                // Dropdown Toggle Button
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-full flex items-center justify-between bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors text-left';
                btn.innerHTML = `<span class="truncate">Select Collections...</span><span class="ml-2 text-[10px] opacity-70">⛶</span>`;
                el.appendChild(btn);

                // Modal Container (Attached to body when opened)
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] hidden items-center justify-center p-4';

                const modalContent = document.createElement('div');
                modalContent.className = 'bg-[#161616] border border-white/10 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all';
                modalOverlay.appendChild(modalContent);

                // Header
                const header = document.createElement('div');
                header.className = 'flex items-center justify-between p-4 border-b border-white/10 bg-black/40';
                header.innerHTML = '<h3 class="text-white font-bold text-sm">Select Collections</h3>';

                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'text-gray-400 hover:text-white transition-colors';
                closeBtn.innerHTML = '✕';
                closeBtn.onclick = () => { modalOverlay.classList.remove('flex'); modalOverlay.classList.add('hidden'); };
                header.appendChild(closeBtn);
                modalContent.appendChild(header);

                // Body (Search & List)
                const searchContainer = document.createElement('div');
                searchContainer.className = 'p-3 border-b border-white/5 bg-[#1a1a1a]';
                const searchInput = document.createElement('input');
                searchInput.type = 'search';
                searchInput.placeholder = 'Search collections...';
                searchInput.className = 'w-full bg-black border border-white/10 text-sm text-white px-3 py-2 rounded focus:border-bprimary focus:ring-1 focus:ring-bprimary outline-none placeholder-gray-500';
                searchContainer.appendChild(searchInput);
                modalContent.appendChild(searchContainer);

                const list = document.createElement('div');
                list.className = 'flex flex-col max-h-[40vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-800 bg-[#111]';
                modalContent.appendChild(list);

                // Footer
                const footer = document.createElement('div');
                footer.className = 'p-4 border-t border-white/10 bg-black/40 flex justify-end';
                const doneBtn = document.createElement('button');
                doneBtn.type = 'button';
                doneBtn.className = 'bg-bprimary hover:bg-bprimary/90 text-white font-bold text-xs px-6 py-2 rounded shadow-lg transition-transform hover:scale-105';
                doneBtn.innerText = 'Save Selection';
                doneBtn.onclick = () => { modalOverlay.classList.remove('flex'); modalOverlay.classList.add('hidden'); };
                footer.appendChild(doneBtn);
                modalContent.appendChild(footer);

                // Note: We'll append modalOverlay to document.body when opened to bypass GrapesJS clipping
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.body.appendChild(modalOverlay);
                    modalOverlay.classList.remove('hidden');
                    modalOverlay.classList.add('flex');
                    setTimeout(() => searchInput.focus(), 50);
                });

                fetch('/api/admin/collections')
                    .then(r => r.json())
                    .then(data => {
                        const collections = Array.isArray(data) ? data : [];
                        if (collections.length === 0) {
                            list.innerHTML = '<span class="text-sm text-gray-500 p-4 text-center block">No collections exist. Create one in Dashboard.</span>';
                            return;
                        }

                        const items: any[] = [];
                        const attrName = trait.get('name') as string;

                        const updateButtonText = () => {
                            const currentVal = trait.target.getAttributes()[attrName] || '';
                            const selectedValues = currentVal.split(',').filter(Boolean);
                            const textSpan = btn.querySelector('span');
                            if (textSpan) {
                                if (selectedValues.length === 0) textSpan.textContent = 'All Products';
                                else if (selectedValues.length === 1) textSpan.textContent = '1 Collection Selected';
                                else textSpan.textContent = `${selectedValues.length} Collections Selected`;
                            }
                        };

                        collections.forEach((c: any) => {
                            const label = document.createElement('label');
                            label.className = 'flex items-center gap-3 p-3 hover:bg-[#222] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/5 mb-1';

                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.value = c.slug;
                            cb.style.appearance = 'auto';
                            cb.style.cursor = 'pointer';
                            cb.className = 'collection-checkbox rounded accent-bprimary w-4 h-4 m-0 flex-shrink-0';

                            // Initialize checked state
                            const currentVal = trait.target.getAttributes()[attrName] || '';
                            const selectedValues = currentVal.split(',').filter(Boolean);
                            if (selectedValues.includes(cb.value)) cb.checked = true;

                            cb.addEventListener('change', () => {
                                const checkboxes = list.querySelectorAll('.collection-checkbox:checked');
                                const values = Array.from(checkboxes).map((i: any) => i.value);
                                trait.target.addAttributes({ [attrName]: values.join(',') });
                                updateButtonText();
                            });

                            const textSpan = document.createElement('span');
                            textSpan.className = 'text-sm text-gray-200 select-none pb-0.5';
                            textSpan.innerText = c.name;

                            label.appendChild(cb);
                            label.appendChild(textSpan);
                            list.appendChild(label);

                            items.push({ el: label, name: c.name.toLowerCase() });
                        });

                        updateButtonText();

                        // Search logic
                        searchInput.addEventListener('input', (e: any) => {
                            const term = e.target.value.toLowerCase();
                            items.forEach(item => {
                                item.el.style.display = item.name.includes(term) ? 'flex' : 'none';
                            });
                        });
                    })
                    .catch(e => console.error("Failed to load collections", e));

                return el;
            },
            // @ts-ignore
            onUpdate({ elInput, component }) {
                // @ts-ignore
                const attrName = this.model.get('name') as string;
                const attrValue = component.getAttributes()[attrName] || '';
                const selectedValues = attrValue.split(',').filter(Boolean);

                // Note: elInput doesn't contain checkboxes anymore since modal is on document.body
                // So we query from document
                const checkboxes = document.querySelectorAll('.collection-checkbox');
                checkboxes.forEach((cb: any) => {
                    cb.checked = selectedValues.includes(cb.value);
                });

                const textSpan = elInput.querySelector('button span');
                if (textSpan) {
                    if (selectedValues.length === 0) textSpan.textContent = 'All Products';
                    else if (selectedValues.length === 1) textSpan.textContent = '1 Collection Selected';
                    else textSpan.textContent = `${selectedValues.length} Collections Selected`;
                }
            }
        });

        editor.TraitManager.addType('product-multi-select', {
            // @ts-ignore
            createInput({ trait }) {
                const el = document.createElement('div');
                el.className = 'w-full mt-1';

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-full flex items-center justify-between bg-black/50 border border-white/10 rounded px-3 py-1.5 text-xs text-white hover:bg-black/70 transition-colors text-left';
                btn.innerHTML = `<span class="truncate">Select Products...</span><span class="ml-2 text-[10px] opacity-70">⛶</span>`;
                el.appendChild(btn);

                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] hidden items-center justify-center p-4';

                const modalContent = document.createElement('div');
                modalContent.className = 'bg-[#161616] border border-white/10 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all';
                modalOverlay.appendChild(modalContent);

                const header = document.createElement('div');
                header.className = 'flex items-center justify-between p-4 border-b border-white/10 bg-black/40';
                header.innerHTML = '<h3 class="text-white font-bold text-sm">Select Products for Slider</h3>';

                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'text-gray-400 hover:text-white transition-colors';
                closeBtn.innerHTML = '✕';
                closeBtn.onclick = () => { modalOverlay.classList.remove('flex'); modalOverlay.classList.add('hidden'); };
                header.appendChild(closeBtn);
                modalContent.appendChild(header);

                const searchContainer = document.createElement('div');
                searchContainer.className = 'p-3 border-b border-white/5 bg-[#1a1a1a]';
                const searchInput = document.createElement('input');
                searchInput.type = 'search';
                searchInput.placeholder = 'Search products...';
                searchInput.className = 'w-full bg-black border border-white/10 text-sm text-white px-3 py-2 rounded focus:border-bprimary focus:ring-1 focus:ring-bprimary outline-none placeholder-gray-500';
                searchContainer.appendChild(searchInput);
                modalContent.appendChild(searchContainer);

                const list = document.createElement('div');
                list.className = 'flex flex-col max-h-[45vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-800 bg-[#111]';
                modalContent.appendChild(list);

                const footer = document.createElement('div');
                footer.className = 'p-4 border-t border-white/10 bg-black/40 flex justify-end';
                const doneBtn = document.createElement('button');
                doneBtn.type = 'button';
                doneBtn.className = 'bg-bprimary hover:bg-bprimary/90 text-white font-bold text-xs px-6 py-2 rounded shadow-lg transition-transform hover:scale-105';
                doneBtn.innerText = 'Save Selection';
                doneBtn.onclick = () => { modalOverlay.classList.remove('flex'); modalOverlay.classList.add('hidden'); };
                footer.appendChild(doneBtn);
                modalContent.appendChild(footer);

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.body.appendChild(modalOverlay);
                    modalOverlay.classList.remove('hidden');
                    modalOverlay.classList.add('flex');
                    setTimeout(() => searchInput.focus(), 50);
                });

                fetch('/api/admin/products')
                    .then(r => r.json())
                    .then(data => {
                        const products = Array.isArray(data) ? data : [];
                        if (products.length === 0) {
                            list.innerHTML = '<span class="text-sm text-gray-500 p-4 text-center block">No products exist. Create one first.</span>';
                            return;
                        }

                        const items: any[] = [];
                        const attrName = trait.get('name') as string;

                        const updateButtonText = () => {
                            const currentVal = trait.target.getAttributes()[attrName] || '';
                            const selectedValues = currentVal.split(',').filter(Boolean);
                            const textSpan = btn.querySelector('span');
                            if (textSpan) {
                                if (selectedValues.length === 0) textSpan.textContent = 'No Products Selected';
                                else if (selectedValues.length === 1) textSpan.textContent = '1 Product Selected';
                                else textSpan.textContent = `${selectedValues.length} Products Selected`;
                            }
                        };

                        products.forEach((p: any) => {
                            const label = document.createElement('label');
                            label.className = 'flex items-center gap-3 p-2.5 hover:bg-[#222] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/5 mb-1';

                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.value = p.slug;
                            cb.style.appearance = 'auto';
                            cb.style.cursor = 'pointer';
                            cb.className = 'product-checkbox rounded accent-bprimary w-4 h-4 m-0 flex-shrink-0';

                            const currentVal = trait.target.getAttributes()[attrName] || '';
                            const selectedValues = currentVal.split(',').filter(Boolean);
                            if (selectedValues.includes(cb.value)) cb.checked = true;

                            cb.addEventListener('change', () => {
                                const checkboxes = list.querySelectorAll('.product-checkbox:checked');
                                const values = Array.from(checkboxes).map((i: any) => i.value);
                                trait.target.addAttributes({ [attrName]: values.join(',') });
                                updateButtonText();
                            });

                            const thumb = document.createElement('div');
                            thumb.className = 'w-10 h-10 bg-black/50 rounded overflow-hidden shrink-0 border border-white/10 flex items-center justify-center relative';
                            const imageUrl = p.images && p.images.length > 0 ? (p.images[0].url || p.images[0]) : null;
                            if (imageUrl) {
                                thumb.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover" />`;
                            } else {
                                thumb.innerHTML = `<span class="text-[9px] text-gray-600">N/A</span>`;
                            }

                            const metaWrapper = document.createElement('div');
                            metaWrapper.className = 'flex flex-col';
                            metaWrapper.innerHTML = `
                                <span class="text-sm text-gray-200 select-none font-semibold truncate max-w-[220px] block">${p.name}</span>
                                <span class="text-[10px] text-gray-500 font-mono truncate">${p.brand?.name || 'Salaf'}</span>
                            `;

                            label.appendChild(cb);
                            label.appendChild(thumb);
                            label.appendChild(metaWrapper);
                            list.appendChild(label);

                            items.push({ el: label, name: p.name.toLowerCase() });
                        });

                        updateButtonText();

                        searchInput.addEventListener('input', (e: any) => {
                            const term = e.target.value.toLowerCase();
                            items.forEach(item => {
                                item.el.style.display = item.name.includes(term) ? 'flex' : 'none';
                            });
                        });
                    })
                    .catch(e => console.error("Failed to load products", e));

                return el;
            },
            // @ts-ignore
            onUpdate({ elInput, component }) {
                // @ts-ignore
                const attrName = this.model.get('name') as string;
                const attrValue = component.getAttributes()[attrName] || '';
                const selectedValues = attrValue.split(',').filter(Boolean);

                const checkboxes = document.querySelectorAll('.product-checkbox');
                checkboxes.forEach((cb: any) => {
                    cb.checked = selectedValues.includes(cb.value);
                });

                const textSpan = elInput.querySelector('button span');
                if (textSpan) {
                    if (selectedValues.length === 0) textSpan.textContent = 'No Products Selected';
                    else if (selectedValues.length === 1) textSpan.textContent = '1 Product Selected';
                    else textSpan.textContent = `${selectedValues.length} Products Selected`;
                }
            }
        });

        // Product Grid Component
        editor.BlockManager.add('product-grid-widget', {
            label: 'Dynamic Product Grid',
            category: 'Storefront Widgets',
            content: `
 <div data-widget="product-grid" data-sort="recent" data-limit="4" data-cols-desktop="4" data-cols-tablet="2" data-cols-mobile="1" data-collection="" class="p-8 border-2 border-dashed border-bprimary/50 bg-bprimary/5 flex items-center justify-center min-h-[200px] w-full my-4">
 <span class="text-bprimary font-bold tracking-widest uppercase">⚡ Live Product Grid Prototype</span>
 </div>
 `
        });
        editor.Components.addType('product-grid-widget', {
            isComponent: el => el.getAttribute && el.getAttribute('data-widget') === 'product-grid',
            model: {
                defaults: {
                    traits: [
                        { type: 'multi-checkbox', name: 'data-collection', label: 'Filter by Collections' },
                        { type: 'number', name: 'data-limit', label: 'Max Products', min: 1, max: 24 },
                        { type: 'select', name: 'data-sort', label: 'Sort By', options: [{ id: 'recent', name: 'Most Recent' }, { id: 'price-asc', name: 'Lowest Price' }, { id: 'price-desc', name: 'Highest Price' }] },
                        { type: 'select', name: 'data-cols-desktop', label: 'Columns (Desktop)', options: [{ id: '2', name: '2' }, { id: '3', name: '3' }, { id: '4', name: '4' }, { id: '5', name: '5' }] },
                        { type: 'select', name: 'data-cols-tablet', label: 'Columns (Tablet)', options: [{ id: '1', name: '1' }, { id: '2', name: '2' }, { id: '3', name: '3' }] },
                        { type: 'select', name: 'data-cols-mobile', label: 'Columns (Mobile)', options: [{ id: '1', name: '1' }, { id: '2', name: '2' }] }
                    ]
                }
            }
        });

        // 3D Product Slider Component
        editor.BlockManager.add('product-slider-3d-widget', {
            label: '3D Product Slider',
            category: 'Storefront Widgets',
            content: `
 <div data-widget="product-slider-3d" data-title="Weekly Bestsellers" data-products="" class="p-8 border-2 border-dashed border-orange-500/50 bg-orange-500/5 flex flex-col items-center justify-center min-h-[200px] w-full my-4 gap-2">
 <span class="text-orange-400 font-bold tracking-widest uppercase text-sm font-sans">3D Slider Carousel</span>
 <span class="text-orange-400/50 text-xs font-sans">Dynamic slider deck. Configure products in the settings panel.</span>
 </div>
 `
        });
        editor.Components.addType('product-slider-3d-widget', {
            isComponent: el => el.getAttribute && el.getAttribute('data-widget') === 'product-slider-3d',
            model: {
                defaults: {
                    traits: [
                        { type: 'text', name: 'data-title', label: 'Carousel Title' },
                        { type: 'product-multi-select', name: 'data-products', label: 'Select Products' }
                    ]
                }
            }
        });

        // Collection List Component
        editor.BlockManager.add('collection-list-widget', {
            label: 'Dynamic Collections',
            category: 'Storefront Widgets',
            content: `
 <div data-widget="collection-list" data-limit="3" class="p-8 border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 flex items-center justify-center min-h-[200px] w-full my-4">
 <span class="text-emerald-500 font-bold tracking-widest uppercase">Featured Collections</span>
 </div>
 `
        });
        editor.Components.addType('collection-list-widget', {
            isComponent: el => el.getAttribute && el.getAttribute('data-widget') === 'collection-list',
            model: {
                defaults: {
                    traits: [
                        { type: 'number', name: 'data-limit', label: 'Max Collections', min: 1, max: 12 }
                    ]
                }
            }
        });

        // Testimonials Carousel Component
        editor.BlockManager.add('testimonials-widget', {
            label: 'Testimonials Carousel',
            category: 'Storefront Widgets',
            content: `
 <div data-widget="testimonials" data-limit="20" class="p-8 border-2 border-dashed border-yellow-500/50 bg-yellow-500/5 flex flex-col items-center justify-center min-h-[160px] w-full my-4 gap-2">
 <span class="text-yellow-400 font-bold tracking-widest uppercase text-sm">Customer Testimonials</span>
 <span class="text-yellow-400/50 text-xs">Scrolling carousel of approved reviews</span>
 </div>
 `
        });
        editor.Components.addType('testimonials-widget', {
            isComponent: (el: any) => el.getAttribute && el.getAttribute('data-widget') === 'testimonials',
            model: {
                defaults: {
                    traits: [
                        { type: 'number', name: 'data-limit', label: 'Max Reviews to Show', min: 1, max: 50 }
                    ]
                }
            }
        });

        // All Reviews List Component
        editor.BlockManager.add('reviews-list-widget', {
            label: 'All Reviews List',
            category: 'Storefront Widgets',
            content: `
 <div data-widget="reviews-list" data-limit="12" class="p-8 border-2 border-dashed border-bprimary/50 bg-bprimary/10 flex flex-col items-center justify-center min-h-[160px] w-full my-4 gap-2">
 <span class="text-bprimary font-bold tracking-widest uppercase text-sm">Reviews List</span>
 <span class="text-bprimary/60 text-xs">Paginated masonry grid of ratings</span>
 </div>
 `
        });
        editor.Components.addType('reviews-list-widget', {
            isComponent: (el: any) => el.getAttribute && el.getAttribute('data-widget') === 'reviews-list',
            model: {
                defaults: {
                    traits: [
                        { type: 'number', name: 'data-limit', label: 'Items per page', min: 1, max: 50, default: 12 }
                    ]
                }
            }
        });

        // Basic Elements
        editor.BlockManager.add('theme-button-primary', {
            label: 'Primary Button',
            category: 'Theme Elements',
            content: {
                type: 'theme-button',
                classes: ['inline-block', 'px-10', 'py-4', 'bg-bprimary', 'text-white', 'font-semibold', 'text-sm', 'tracking-[0.2em]', 'font-heading', 'uppercase', 'hover:bg-white', 'hover:text-black', 'transition-all', 'duration-300', 'shadow-md', 'rounded-md'],
                attributes: { href: '#', 'data-align': 'left' },
                content: 'Shop Now'
            }
        });

        editor.BlockManager.add('theme-button-outline', {
            label: 'Outline Button',
            category: 'Theme Elements',
            content: {
                type: 'theme-button',
                classes: ['inline-block', 'px-10', 'py-4', 'border', 'border-bprimary-dark', '', 'text-bprimary-dark', '', 'font-semibold', 'text-sm', 'tracking-[0.2em]', 'font-heading', 'uppercase', 'hover:bg-bprimary-dark', '', 'hover:text-background', '', 'transition-all', 'duration-300', 'rounded-md'],
                attributes: { href: '#', 'data-align': 'left' },
                content: 'Discover More'
            }
        });

        editor.Components.addType('theme-button', {
            extend: 'link',
            isComponent: (el: any) => el.tagName === 'A' && (el.classList?.contains('bg-bprimary') || el.classList?.contains('border-bprimary')),
            model: {
                defaults: {
                    tagName: 'a',
                    attributes: { href: '#', 'data-align': 'left' },
                    classes: ['inline-block', 'px-10', 'py-4', 'font-semibold', 'text-sm', 'tracking-[0.2em]', 'font-heading', 'uppercase', 'transition-all', 'duration-300', 'shadow-md', 'rounded-md'],
                    traits: [
                        { type: 'text', name: 'href', label: 'Link URL' },
                        {
                            type: 'select',
                            // Use the 'name' to map directly to an HTML attribute
                            name: 'data-align',
                            label: 'Alignment',
                            options: [
                                { id: 'left', name: 'Left (Default)' },
                                { id: 'center', name: 'Center' },
                                { id: 'right', name: 'Right' }
                            ]
                        }
                    ]
                },
                init() {
                    // React when the data-align attribute changes via the trait
                    this.on('change:attributes:data-align', this.applyAlignClasses);
                    // Apply on initial load too
                    this.applyAlignClasses();
                },
                applyAlignClasses() {
                    const align = this.getAttributes()['data-align'] || 'left';
                    const allCls = ['inline-block', 'block', 'mx-auto', 'ml-auto', 'mr-0', 'w-fit'];
                    allCls.forEach((c: string) => this.removeClass(c));
                    if (align === 'center') {
                        ['block', 'mx-auto', 'w-fit'].forEach((c: string) => this.addClass(c));
                    } else if (align === 'right') {
                        ['block', 'ml-auto', 'w-fit'].forEach((c: string) => this.addClass(c));
                    } else {
                        this.addClass('inline-block');
                    }
                }
            }
        });

        // --- 4. Product Details CORE Placeholder (For Templates Only) ---
        editor.BlockManager.add('product-core-placeholder', {
            label: 'Current Product Core (Template)',
            category: 'Template Elements',
            content: `
 <div data-widget="product-core" class="p-12 border border-purple-500 bg-purple-500/10 flex flex-col items-center justify-center min-h-[400px] w-full my-4 rounded">
 <span class="text-purple-400 font-bold text-xl uppercase tracking-widest mb-2">🛍️ Product Detail View</span>
 <span class="text-purple-400/60 text-sm">Image Gallery, Title, Price, and Add to Cart will render here.</span>
 </div>
 `
        });
        editor.Components.addType('product-core-placeholder', {
            isComponent: el => el.getAttribute && el.getAttribute('data-widget') === 'product-core',
            model: { defaults: { traits: [] } } // No traits needed, it auto-injects
        });

        // --- 4. Premium Blocks (Enterprise User Friendly) ---
        editor.BlockManager.add('hero-banner', {
            label: 'Hero Banner V1',
            category: 'Premium Layouts',
            content: `
 <section data-gjs-droppable="false" class="relative bg-background overflow-hidden py-32 px-6 flex items-center justify-center min-h-[600px] border-y border-border">
 <div data-gjs-droppable="false" data-gjs-hoverable="false" class="absolute inset-0 bg-linear-to-br from-bprimary/20 to-background pointer-events-none"></div>
 <div data-gjs-droppable="false" class="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
 <h1 class="text-5xl md:text-7xl font-bold font-heading text-foreground mb-6 tracking-tight">Premium Elegance</h1>
 <p class="text-lg text-muted-foreground mb-10 max-w-2xl font-light">Experience the height of luxury with our curated collection of fragrances and attars.</p>
 <a href="/shop" class="bg-bprimary-dark text-white font-bold uppercase tracking-widest px-10 py-4 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">Explore Collection</a>
 </div>
 </section>
 `
        });

        editor.BlockManager.add('feature-grid', {
            label: 'Features 3-Col',
            category: 'Premium Layouts',
            content: `
 <section data-gjs-droppable="false" class="py-24 bg-background">
 <div data-gjs-droppable="false" class="container mx-auto px-6">
 <div data-gjs-droppable="false" class="text-center mb-16">
 <h2 class="text-4xl font-heading font-bold text-foreground mb-4">Why Choose Us</h2>
 <p class="text-muted-foreground">Exceptional quality in every detail.</p>
 </div>
 <div data-gjs-droppable="false" class="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div data-gjs-droppable="false" class="p-8 border border-border rounded-2xl bg-muted/40 text-center hover:border-bprimary-dark/50 transition-colors">
 <h3 class="text-xl font-bold text-foreground mb-3">Authentic Sourcing</h3>
 <p class="text-muted-foreground text-sm">Directly from the best producers.</p>
 </div>
 <div data-gjs-droppable="false" class="p-8 border border-border rounded-2xl bg-muted/40 text-center hover:border-bprimary-dark/50 transition-colors">
 <h3 class="text-xl font-bold text-foreground mb-3">Premium Quality</h3>
 <p class="text-muted-foreground text-sm">Crafted with attention to detail.</p>
 </div>
 <div data-gjs-droppable="false" class="p-8 border border-border rounded-2xl bg-muted/40 text-center hover:border-bprimary-dark/50 transition-colors">
 <h3 class="text-xl font-bold text-foreground mb-3">Timeless Elegance</h3>
 <p class="text-muted-foreground text-sm">Designed to leave a lasting impression.</p>
 </div>
 </div>
 </div>
 </section>
 `
        });

        editor.BlockManager.add('testimonial-single', {
            label: 'Testimonial Highlight',
            category: 'Premium Layouts',
            content: `
 <section data-gjs-droppable="false" class="py-20 bg-background border-y border-border">
 <div data-gjs-droppable="false" class="max-w-4xl mx-auto px-6 text-center">
 <p class="text-2xl md:text-4xl font-heading font-light text-foreground italic mb-8">"This fragrance completely changed my perspective on traditional attars. The quality is unmatched."</p>
 <div data-gjs-droppable="false" class="flex flex-col items-center">
 <h4 class="text-foreground font-bold uppercase tracking-widest text-sm">— Ahmed R.</h4>
 <span class="text-muted-foreground text-xs mt-1">Verified Buyer</span>
 </div>
 </div>
 </section>
 `
        });

        editor.BlockManager.add('faq-block', {
            label: 'FAQ Block',
            category: 'Premium Layouts',
            content: `
 <section data-gjs-droppable="false" class="py-24 bg-background">
 <div data-gjs-droppable="false" class="max-w-3xl mx-auto px-6">
 <div class="text-center mb-12">
 <h2 class="text-4xl font-heading font-bold text-foreground mb-4">Frequently Asked Questions</h2>
 </div>
 <div data-gjs-droppable="false" class="space-y-6">
 <div class="p-6 bg-muted/40 border border-border rounded-xl">
 <h4 class="text-lg font-bold text-foreground mb-2">How long does shipping take?</h4>
 <p class="text-muted-foreground text-sm">We typically process orders within 1-2 business days.</p>
 </div>
 <div class="p-6 bg-muted/40 border border-border rounded-xl">
 <h4 class="text-lg font-bold text-foreground mb-2">What is your return policy?</h4>
 <p class="text-muted-foreground text-sm">We accept returns within 14 days of delivery for untouched items.</p>
 </div>
 </div>
 </div>
 </section>
 `
        });

        editor.BlockManager.add('mosaic-grid-v1', {
            label: 'Mosaic Grid Bento',
            category: 'Premium Layouts',
            content: `
 <section class="py-16 px-6 bg-background overflow-hidden">
 <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[650px]">
 <!-- Large Feature Image Column -->
 <div class="h-[450px] md:h-full relative overflow-hidden rounded-3xl group border border-border shadow-2xl">
 <img src="https://images.unsplash.com/photo-1616949113020-68af4944f51e?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 <div class="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-60"></div>
 <div class="absolute bottom-8 left-8">
 <span class="text-bprimary-dark text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">Premium Experience</span>
 <h3 class="text-foreground text-3xl font-heading font-bold">Zahab Exclusive</h3>
 </div>
 </div>
 
 <!-- Nested Grid Column -->
 <div class="grid grid-cols-1 md:grid-rows-2 gap-4 h-full">
 <!-- Top Wide Image -->
 <div class="h-[300px] md:h-full relative overflow-hidden rounded-3xl group border border-border">
 <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 <div class="absolute inset-0 bg-background/20 group-hover:bg-background/40 transition-colors"></div>
 </div>
 
 <!-- Bottom Two Squares -->
 <div class="grid grid-cols-2 gap-4 h-full">
 <div class="h-[220px] md:h-full relative overflow-hidden rounded-3xl group border border-border">
 <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 </div>
 <div class="h-[220px] md:h-full relative overflow-hidden rounded-3xl group border border-border">
 <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 </div>
 </div>
 </div>
 </div>
 </section>
 `
        });
    };

    const gjsOptions = {
        height: '100%',
        storageManager: false, // We handle storage manually via API
        plugins: [
            webpagePlugin,
            basicBlocks,
            customDynamicWidgetsPlugin
        ],
        pluginsOpts: {
            'grapesjs-preset-webpage': {
                // Adjust webpage preset options if needed
                blocksBasicOpts: { flexGrid: true }
            }
        },
        canvas: {
            scripts: [
                // The Tailwind Play CDN reads `tailwind.config` from window BEFORE it processes.
                // We must set it synchronously in a prior script tag.
                'data:application/javascript,tailwind={config:{theme:{extend:{colors:{bprimary:"%23d4af37", "bprimary-dark":"%23a67c00"}}}}}',
                'https://cdn.tailwindcss.com'
            ],
            styles: [
                'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
                'data:text/css,body { padding-bottom: 600px !important; }',
                `data:text/css,
 :root { --color-bprimary: %23d4af37; --color-bprimary-dark: %23a67c00; }
 .bg-bprimary { background-color: %23d4af37 !important; }
 .bg-bprimary-dark { background-color: %23a67c00 !important; }
 .text-bprimary { color: %23d4af37 !important; }
 .text-bprimary-dark { color: %23a67c00 !important; }
 .border-bprimary { border-color: %23d4af37 !important; }
 .border-bprimary-dark { border-color: %23a67c00 !important; }
 .hover\\:bg-bprimary:hover { background-color: %23d4af37 !important; }
 .hover\\:bg-bprimary- { background-color: %23a67c00 !important; }
 .hover\\:text-bprimary:hover { color: %23d4af37 !important; }
 .hover\\:text-bprimary- { color: %23a67c00 !important; }
 .hover\\:border-bprimary:hover { border-color: %23d4af37 !important; }
 .hover\\:border-bprimary- { border-color: %23a67c00 !important; }
 .accent-bprimary { accent-color: %23d4af37 !important; }
 .accent-bprimary-dark { accent-color: %23a67c00 !important; }
 `
            ]
        },
        // Proper device breakpoints so Style Manager scopes to @media queries
        deviceManager: {
            devices: [
                {
                    name: 'Desktop',
                    width: '', // No media query = global styles
                },
                {
                    name: 'Tablet',
                    width: '768px',
                    widthMedia: '992px', // applies inside @media (max-width: 992px)
                },
                {
                    name: 'Mobile',
                    width: '375px',
                    widthMedia: '767px', // applies inside @media (max-width: 767px)
                }
            ]
        }
    };

    const onEditor = (editorInstance: Editor) => {
        setEditor(editorInstance);

        // Remove confusing sectors for non-tech users and enforce simplicity
        const styleManager = editorInstance.StyleManager;
        styleManager.removeSector('layout'); // Complex flexbox
        styleManager.removeSector('position');
        styleManager.removeSector('extra'); // Transitions, transforms

        styleManager.addSector('branding', {
            name: 'Branding & Theme',
            open: true,
            properties: [
                {
                    type: 'select',
                    name: 'Background Style',
                    property: 'tw-bg',
                    label: 'Background Theme',
                    options: [
                        { id: '', name: 'Default/None' },
                        { id: 'bg-background', name: 'Theme Background' },
                        { id: 'bg-card', name: 'Theme Card' },
                        { id: 'bg-muted', name: 'Theme Muted' },
                        { id: 'bg-bprimary', name: 'Gold (Dark Mode)' },
                        { id: 'bg-bprimary-dark', name: 'Gold (Light Mode)' },
                        { id: 'bg-[#1a1a1a]', name: 'Elevated Dark (Legacy)' },
                        { id: 'bg-white', name: 'Pure White' },
                    ]
                },
                {
                    type: 'select',
                    name: 'Text Emphasis',
                    property: 'tw-text',
                    label: 'Text Color Theme',
                    options: [
                        { id: '', name: 'Inherit' },
                        { id: 'text-foreground', name: 'Theme Foreground' },
                        { id: 'text-muted-foreground', name: 'Theme Muted' },
                        { id: 'text-bprimary', name: 'Gold (Dark Mode)' },
                        { id: 'text-bprimary-dark', name: 'Gold (Light Mode)' },
                        { id: 'text-white', name: 'Bright White' },
                    ]
                },
                {
                    type: 'select',
                    name: 'Component Type',
                    property: 'tw-preset',
                    label: 'Preset Style',
                    options: [
                        { id: '', name: 'Standard' },
                        { id: 'rounded-full px-8 py-4 bg-foreground text-background hover:scale-105 transition-transform inline-block', name: 'Pill Button (Primary)' },
                        { id: 'border border-bprimary-dark text-bprimary-dark px-6 py-3 rounded hover:bg-muted transition-colors inline-block', name: 'Outline Button' },
                        { id: 'shadow-2xl shadow-primary/20 border border-border bg-card backdrop-blur-md rounded-2xl p-8', name: 'Premium Segment Card' }
                    ]
                },
                // Note: Button alignment is handled via the 'data-align' trait in the Settings panel
                // The Style Manager approach cannot persist class changes across saves
            ],
        });

        // Listen for internal "style" changes that are actually Tailwind classes
        editorInstance.on('component:styleUpdate', (component: any) => {
            const style = component.getStyle();

            // Handle Background Classes
            if (style['tw-bg']) {
                const classes = ['bg-background', 'bg-card', 'bg-muted', 'bg-bprimary', 'bg-bprimary-dark', 'bg-[#1a1a1a]', 'bg-black', 'bg-white'];
                classes.forEach(c => component.removeClass(c));
                if (style['tw-bg'] !== '') component.addClass(style['tw-bg']);
                component.removeStyle('tw-bg');
            }

            // Handle Text Classes
            if (style['tw-text']) {
                const classes = ['text-foreground', 'text-muted-foreground', 'text-bprimary', 'text-bprimary-dark', 'text-white', 'text-gray-400', 'text-gray-600'];
                classes.forEach(c => component.removeClass(c));
                if (style['tw-text'] !== '') component.addClass(style['tw-text']);
                component.removeStyle('tw-text');
            }

            // Handle Preset Classes
            if (style['tw-preset']) {
                const presets = [
                    'rounded-full px-8 py-4 bg-foreground text-background hover:scale-105 transition-transform inline-block',
                    'rounded-full px-8 py-4 bg-bprimary text-white hover:scale-105 transition-transform inline-block',
                    'border border-bprimary-dark text-bprimary-dark px-6 py-3 rounded hover:bg-muted transition-colors inline-block',
                    'border border-bprimary text-bprimary px-6 py-3 rounded hover:bg-bprimary/10 transition-colors inline-block',
                    'shadow-2xl shadow-primary/20 border border-border bg-card backdrop-blur-md rounded-2xl p-8',
                    'shadow-2xl shadow-bprimary/20 border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-8'
                ];
                presets.forEach(p => p.split(' ').forEach(c => component.removeClass(c)));
                if (style['tw-preset'] !== '') style['tw-preset'].split(' ').forEach((c: string) => component.addClass(c));
                component.removeStyle('tw-preset');
            }

        });

        styleManager.addSector('typography', {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'text-align', 'line-height']
        });
        styleManager.addSector('decorations', {
            name: 'Decorations (Advanced)',
            open: false,
            buildProps: ['background-color', 'background-image', 'border-radius', 'border', 'opacity']
        });
        styleManager.addSector('dimensions', {
            name: 'Spacing & Size',
            open: false,
            buildProps: ['width', 'min-height', 'margin', 'padding']
        });

        // Pre-load common selectors for easier search
        const slm = editorInstance.SelectorManager;
        ['bg-background', 'text-foreground', 'bg-bprimary', 'bg-bprimary-dark', 'text-bprimary', 'text-bprimary-dark', 'hover:scale-110', 'transition-all', 'font-heading', 'font-heading-bold', 'border-bprimary', 'border-bprimary-dark'].forEach(cls => {
            slm.add({ name: cls, label: cls });
        });

        // Load initial HTML/CSS
        if (initialData.html || initialData.css) {
            editorInstance.setComponents(initialData.html || '');
            if (initialData.css) {
                editorInstance.setStyle(initialData.css);
            }
        }

        // Hook into Preview mode
        editorInstance.on('run:preview', () => {
            document.body.classList.add('gjs-preview-mode');
        });
        editorInstance.on('stop:preview', () => {
            document.body.classList.remove('gjs-preview-mode');
        });
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#050505] theme-builder-container">
            {/* Top Toolbar */}
            <div className="h-14 shrink-0 bg-[#161616] border-b border-white/10 flex items-center justify-between px-4 z-10 shadow-lg relative page-editor-toolbar">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" title="Back to Dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-tight">{title}</span>
                        <span className="text-[10px] text-gray-500 font-mono leading-tight">/{slug}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-400">Status:</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${status === 'published' ? 'text-green-400' : 'text-yellow-500'}`}>
                            {status}
                        </span>
                    </div>

                    <Button
                        onClick={() => setShowSettings(!showSettings)}
                        variant="outline"
                        size="sm"
                        className="bg-[#222] border-white/10 text-white hover:bg-white"
                    >
                        <Settings2 className="w-4 h-4 mr-2" /> Page Settings
                    </Button>

                    <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={isSaving}
                        className="bg-bprimary hover:bg-bprimary/90 text-white shadow-lg shadow-bprimary/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

                {/* Embedded Settings Dropdown */}
                {showSettings && (
                    <div className="absolute top-14 right-4 w-96 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-[#161616] border border-white/10 shadow-2xl rounded-b-xl p-5 flex flex-col gap-4 z-50">
                        <h3 className="text-sm font-bold text-bprimary border-b border-white/10 pb-2 mb-2">Page Metadata</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">Page Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">URL Slug</label>
                            <input value={slug} onChange={handleSlugChange} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm font-mono text-gray-300" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white">
                                    <option value="draft">Draft (Hidden)</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 justify-end pb-1">
                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                    <input type="checkbox" checked={isHome} onChange={e => setIsHome(e.target.checked)} className="rounded bg-black border-white/20 text-bprimary" /> Set as Home Layout
                                </label>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-300 border-b border-white/10 pb-2 mt-2">SEO Variables</h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">SEO Title</label>
                            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white" placeholder="Optimal SEO Title" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400">SEO Description</label>
                            <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-[80px]" placeholder="Brief meta description for search engines" />
                        </div>
                    </div>
                )}
            </div>

            {/* GrapesJS Workspace */}
            <div className="flex-1 overflow-hidden relative theme-builder-workspace">
                <GjsEditor
                    grapesjs={grapesjs}
                    options={gjsOptions as any}
                    onEditor={onEditor}
                />
            </div>

            {/* Global Styles Overrides for dark theme GrapesJS */}
            <style dangerouslySetInnerHTML={{
                __html: `
 .theme-builder-workspace .gjs-cv-canvas {
 background-color: #f3f4f6;
 }
.gjs-cv-canvas iframe { max-width: 100%; display: block; }
.gjs-cv-canvas .map-responsive { position: relative; width: 100%; }
.gjs-cv-canvas .map-responsive iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
/* Fix GrapesJS row/cell grid to be responsive columns */
.gjs-cv-canvas .gjs-row { display: flex !important; flex-wrap: wrap !important; gap: 16px !important; width: 100% !important; }
/* Default cells grow evenly, unless a width is explicitly set (e.g., 3/7 columns) */
.gjs-cv-canvas .gjs-cell { display: block !important; flex: 1 1 0 !important; min-width: 300px !important; height: auto !important; }
/* Respect explicit column widths generated by the editor (e.g., style="width:30%") */
.gjs-cv-canvas .gjs-row .gjs-cell[style*="width"] { flex: 0 0 auto !important; min-width: 0 !important; }
@media (max-width: 768px) {
  .gjs-cv-canvas .gjs-cell { min-width: 100% !important; }
}
/* Ensure utility-styled iframes don't get fixed heights from inline/exported rules */
.gjs-cv-canvas .absolute.inset-0.w-full.h-full.border-0.rounded-xl.shadow-sm { height: 100% !important; }
 .gjs-one-bg { background-color: #161616; color: #fff; }
 .gjs-two-color { color: #d4af37; }
 .gjs-three-bg { background-color: #d4af37; color: #fff; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(192, 107, 64, 0.4); }
 .gjs-four-color, .gjs-four-color-h:hover { color: #d4af37; }
 
 /* Configure layout bounds and scrolling behaviors for the settings panel */
 .gjs-pn-views-container { height: calc(100% - 40px) !important; overflow-y: auto !important; }
 .gjs-editor { border-top: 1px solid rgba(255,255,255,0.05); }
 .gjs-pn-panel { border-color: rgba(255,255,255,0.05) !important; }
 .gjs-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; box-shadow: none; transition: all 0.2s; }
 .gjs-block:hover { background: rgba(192, 107, 64, 0.1); border-color: rgba(192, 107, 64, 0.3); }

 /* Fullscreen Preview Mode */
 body.gjs-preview-mode .theme-builder-container {
 position: fixed !important;
 top: 0 !important;
 left: 0 !important;
 width: 100vw !important;
 height: 100vh !important;
 z-index: 999999 !important;
 }
 body.gjs-preview-mode .page-editor-toolbar {
 display: none !important;
 }
 `}} />
        </div>
    );
}
