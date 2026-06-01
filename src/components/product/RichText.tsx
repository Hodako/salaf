"use client";

import { RichTextSectionData } from "@/types/models";

/**
 * A component that renders rich text (HTML) content within a constrained width.
 * 
 * Uses Tailwind Typography (prose) to style the injected HTML. 
 * Supports both light and dark modes with theme-aware prose adjustments.
 */
export function RichText({ data }: { data: RichTextSectionData }) {
 if (!data || !data.htmlContent) return null;

 return (
 <section className="w-full py-16 px-4 md:px-12 lg:px-24 bg-background">
 <div className="max-w-3xl mx-auto">
 <div
 className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:font-medium prose-headings:tracking-wide prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-light prose-a:text-bprimary-dark prose-a:transition-colors hover:prose-a:text-[#d48863] prose-blockquote:border-l-bprimary-dark prose-blockquote:bg-muted prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
 // In a true enterprise app, run this through DOMPurify before dangerouslySetInnerHTML
 dangerouslySetInnerHTML={{ __html: data.htmlContent }}
 />
 </div>
 </section>
 );
}
