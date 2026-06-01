"use client";

import { VideoEmbedSectionData } from "@/types/models";

export function VideoEmbed({ data }: { data: VideoEmbedSectionData }) {
 if (!data.videoUrl) return null;

 // Helper to safely embed YouTube if the user pastes a standard watch link
 const getEmbedUrl = (url: string) => {
 try {
 if (url.includes('youtube.com/watch?v=')) {
 return url.replace('watch?v=', 'embed/');
 }
 if (url.includes('youtu.be/')) {
 return url.replace('youtu.be/', 'youtube.com/embed/');
 }
 return url;
 } catch {
 return url;
 }
 };

 return (
 <section className="w-full py-24 px-4 md:px-12 lg:px-24 bg-background border-y border-border">
 <div className="max-w-5xl mx-auto flex flex-col items-center">

 {data.title && (
 <h2 className="text-3xl md:text-5xl font-heading font-medium tracking-wide text-foreground mb-12 text-center">
 {data.title}
 </h2>
 )}

 <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(192,107,64,0.1)] border border-border relative">
 <iframe
 src={getEmbedUrl(data.videoUrl)}
 title={data.title || "Video Embed"}
 className="absolute top-0 left-0 w-full h-full"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 />
 </div>

 </div>
 </section>
 );
}
