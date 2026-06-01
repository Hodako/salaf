"use client";

import { useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { ImgBBUploadProps } from "@/types";

export function ImgBBUploader({ value, onChange, label, className = "", mini = false }: ImgBBUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // Basic validation (Allow any image format / extension to pass to the upload endpoint)
        if (file.size > 32 * 1024 * 1024) { // 32MB limit to allow raw high-res camera photos
            toast.error("Image must be smaller than 32MB.");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", file);

            // POST to ImgBB
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed.");

            const data = await res.json();

            if (data?.data?.url) {
                onChange(data.data.url);
            } else {
                throw new Error("Invalid response from image server.");
            }

        } catch (error: any) {
            toast.error("Failed to upload image. Please check your API key and internet connection.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && <label className="text-sm font-medium text-gray-300">{label}</label>}

            {value ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black/50 border border-white/10 group">
                    <Image src={value} alt="Uploaded media" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500/40 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <label
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative w-full aspect-video rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                        ${dragActive ? 'border-[#c06b40] bg-[#c06b40]/5' : 'border-white/20 bg-black/20 hover:bg-white/5 hover:border-white/40'}
                    `}
                >
                    <input
                        type="file"
                        accept="image/*, .heic, .heif, .avif, .svg, .gif, .png, .jpg, .jpeg, .webp, *"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />

                    <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin text-[#c06b40] mb-3" />
                                <span className="text-sm font-medium text-[#c06b40]">Uploading securely...</span>
                            </>
                        ) : (
                            <div className={`flex flex-col items-center justify-center pt-5 pb-6 text-center ${mini ? 'scale-75' : ''}`}>
                                <UploadCloud className={`text-gray-400 mb-2 ${mini ? 'w-6 h-6' : 'w-10 h-10'}`} />
                                {!mini && (
                                    <>
                                        <p className="mb-2 text-sm text-gray-300">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">Any image format is allowed (MAX. 32MB)</p>
                                    </>
                                )}
                                {mini && <p className="text-xs text-gray-400 mt-1">Add Image</p>}
                            </div>
                        )}
                    </div>

                    {/* Drag Active Overlay */}
                    {dragActive && !isUploading && (
                        <div className="absolute inset-0 bg-[#c06b40]/10 flex items-center justify-center backdrop-blur-sm z-20">
                            <span className="text-white font-medium text-lg pointer-events-none tracking-wide">Drop image here</span>
                        </div>
                    )}
                </label>
            )}
        </div>
    );
}
