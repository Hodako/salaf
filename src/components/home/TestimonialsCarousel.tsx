import { dbConnect } from '@/helpers';
import { ExternalReview } from '@/models/ExternalReview';
import { IExternalReviewDocument } from '@/types/models.types';
import TestimonialsCarouselClient from './TestimonialsCarouselClient';

interface TestimonialsCarouselProps {
    limit?: number;
}

/**
 * Server component: fetches approved reviews and passes them to the client carousel.
 */
export const TestimonialsCarousel = async ({ limit = 20 }: TestimonialsCarouselProps) => {
    await dbConnect();

    const raw = await ExternalReview.find({ isApproved: true })
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    const reviews = JSON.parse(JSON.stringify(raw)) as IExternalReviewDocument[];

    if (!reviews || reviews.length === 0) return null;

    return <TestimonialsCarouselClient reviews={reviews} />;
};

export default TestimonialsCarousel;
