import { Metadata } from 'next';
import Link from 'next/link';
import ReviewsListWidget from '@/components/blocks/ReviewsListWidget';

export const metadata: Metadata = {
    title: 'Customer Reviews | What Collectors Say | Salaf - سلف',
    description: 'Read real feedback and testimonials from our valued customers about Salaf premium attars, ouds, and perfumes.',
    alternates: {
        canonical: 'https://salaf.bd/reviews',
    },
    openGraph: {
        title: 'Customer Reviews | What Collectors Say | Salaf',
        description: 'Read real feedback and testimonials from our valued customers about Salaf premium attars, ouds, and perfumes.',
        type: 'website',
        url: 'https://salaf.bd/reviews',
        images: [{ url: '/og-image.png', alt: 'Salaf Customer Reviews' }],
    }
};

export default function ReviewsPage() {
    const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Reviews', url: '/reviews' }
    ];

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-2">
                {/* Accessible Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        {breadcrumbs.map((crumb, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                {idx > 0 && <span aria-hidden="true">/</span>}
                                {idx === breadcrumbs.length - 1 ? (
                                    <span className="text-muted-foreground" aria-current="page">
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link href={crumb.url} className="hover:text-foreground transition-colors">
                                        {crumb.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            <ReviewsListWidget />
        </main>
    );
}
