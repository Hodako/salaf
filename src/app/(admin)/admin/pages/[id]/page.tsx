"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePage, useUpdatePage } from "@/hooks/useAdminPages";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { Loader2 } from "lucide-react";

export default function EditPageScreen() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    
    const { data: page, isLoading, error } = usePage(id);
    const { mutateAsync: updatePage } = useUpdatePage();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#c06b40]" />
                    <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Initializing Theme Builder...</p>
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <div className="text-center text-red-400">
                    <p>Failed to load builder.</p>
                </div>
            </div>
        );
    }

    const handleSave = async (html: string, css: string, meta: any) => {
        await updatePage({
            id,
            data: {
                html,
                css,
                title: meta.title,
                slug: meta.slug,
                status: meta.status,
                isHome: meta.isHome,
                seo: meta.seo
            }
        });
    };

    return (
        // We use absolute inset-0 to perfectly fill the relative main container
        // This keeps the sidebar and top header visible!
        <div className="absolute inset-0 z-50 bg-[#161616] overflow-hidden">
            <PageEditor 
                initialData={page} 
                onSave={handleSave} 
                onClose={() => router.push('/admin/pages')}
            />
        </div>
    );
}
