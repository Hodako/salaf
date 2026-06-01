"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export default function AdminNavigationPage() {
    const { data: settings, isLoading } = useSettings();
    const { mutateAsync: updateSettings } = useUpdateSettings();

    const [isSaving, setIsSaving] = useState(false);
    
    // Social Links
    const [socialLinks, setSocialLinks] = useState<{ platform: string, url: string }[]>([]);
    // Footer Columns (Menus)
    const [footerMenus, setFooterMenus] = useState<{ title: string, links: { label: string, url: string }[] }[]>([]);

    useEffect(() => {
        if (settings) {
            setSocialLinks(settings.footer_social_links || []);
            setFooterMenus(settings.footer_menus || []);
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSettings({
                footer_social_links: socialLinks,
                footer_menus: footerMenus
            });
            toast.success("Navigation settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#c06b40]" /></div>;
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-medium tracking-wide text-white mb-2 flex items-center gap-3">
                        <Navigation className="w-8 h-8 text-[#c06b40]" /> Footer Navigation
                    </h1>
                    <p className="text-gray-400">Configure global footer links, menus, and social media.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="bg-[#c06b40] text-white hover:bg-[#c06b40]/90">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            {/* Social Links Form */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Social Media Links</h2>
                    <Button 
                        onClick={() => setSocialLinks([...socialLinks, { platform: 'Facebook', url: '' }])}
                        variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Social Link
                    </Button>
                </div>
                
                {socialLinks.length === 0 && <p className="text-gray-500 text-sm mb-4">No social links added yet.</p>}
                
                <div className="space-y-3">
                    {socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-black/40 p-3 rounded-xl border border-white/5">
                            <select 
                                value={link.platform?.toLowerCase()} 
                                onChange={(e) => {
                                    const newLinks = [...socialLinks];
                                    newLinks[idx].platform = e.target.value;
                                    setSocialLinks(newLinks);
                                }}
                                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c06b40]"
                            >
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="twitter">Twitter</option>
                                <option value="tiktok">TikTok</option>
                                <option value="youtube">YouTube</option>
                            </select>
                            <input 
                                type="url" 
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => {
                                    const newLinks = [...socialLinks];
                                    newLinks[idx].url = e.target.value;
                                    setSocialLinks(newLinks);
                                }}
                                className="flex-1 bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c06b40]"
                            />
                            <button 
                                onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                                className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Menus Form */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Footer Columns (Menus)</h2>
                    <Button 
                        onClick={() => setFooterMenus([...footerMenus, { title: 'New Menu', links: [] }])}
                        variant="outline" size="sm" className="border-[#c06b40]/30 text-[#c06b40] hover:bg-[#c06b40]/10"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Column
                    </Button>
                </div>

                {footerMenus.length === 0 && <p className="text-gray-500 text-sm">No menus configured yet.</p>}

                <div className="grid grid-cols-1 gap-6">
                    {footerMenus.map((menu, mIdx) => (
                        <div key={mIdx} className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <input 
                                    type="text" 
                                    value={menu.title}
                                    placeholder="Menu Title (e.g., Quick Links)"
                                    onChange={(e) => {
                                        const newMenus = [...footerMenus];
                                        newMenus[mIdx].title = e.target.value;
                                        setFooterMenus(newMenus);
                                    }}
                                    className="font-bold text-lg bg-transparent border-b border-transparent focus:border-[#c06b40] text-white outline-none px-1 py-1 w-64"
                                />
                                <div className="flex-1" />
                                <Button 
                                    onClick={() => {
                                        const newMenus = [...footerMenus];
                                        newMenus[mIdx].links.push({ label: 'New Link', url: '/' });
                                        setFooterMenus(newMenus);
                                    }}
                                    size="sm" variant="ghost" className="text-gray-300 hover:text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Link
                                </Button>
                                <button 
                                    onClick={() => setFooterMenus(footerMenus.filter((_, i) => i !== mIdx))}
                                    className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {menu.links.map((link, lIdx) => (
                                    <div key={lIdx} className="flex gap-3 items-center">
                                        <input 
                                            type="text" 
                                            placeholder="Label"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newMenus = [...footerMenus];
                                                newMenus[mIdx].links[lIdx].label = e.target.value;
                                                setFooterMenus(newMenus);
                                            }}
                                            className="w-1/3 bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="URL (e.g., /about)"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newMenus = [...footerMenus];
                                                newMenus[mIdx].links[lIdx].url = e.target.value;
                                                setFooterMenus(newMenus);
                                            }}
                                            className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-gray-300 focus:outline-none focus:border-white/30"
                                        />
                                        <button 
                                            onClick={() => {
                                                const newMenus = [...footerMenus];
                                                newMenus[mIdx].links = newMenus[mIdx].links.filter((_, i) => i !== lIdx);
                                                setFooterMenus(newMenus);
                                            }}
                                            className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
