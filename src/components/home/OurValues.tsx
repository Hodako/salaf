import Image from "next/image";
import { ValuesSectionData } from "@/types";

interface OurValuesProps {
    data: ValuesSectionData;
}

export const OurValues = ({ data }: OurValuesProps) => {
    return (
        <section className="relative w-full bg-background overflow-hidden">
            <div className="container mx-auto flex flex-col lg:flex-row min-h-[260px] sm:min-h-[350px] lg:min-h-[600px]">

                {/* Left Side - Image */}
                <div className="relative w-full lg:w-1/2 min-h-[150px] sm:min-h-[220px] lg:min-h-full">
                    <Image
                        src={data.imageUrl}
                        alt="Our Values Image"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Gradient to blend right edge into background */}
                    <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-r from-transparent to-background pointer-events-none hidden lg:block"></div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-3 sm:px-4 py-3 sm:py-8 md:py-8 md:px-12 lg:px-16 lg:py-12 z-10 text-center lg:text-left">
                    <h2
                        className="text-2xl md:text-5xl font-heading font-medium text-bprimary-dark mb-2 sm:mb-10 tracking-wide"
                        dangerouslySetInnerHTML={{ __html: data.title }}
                    />

                    <div className="space-y-2 sm:space-y-6 text-muted-foreground text-xs sm:text-sm md:text-[15px] font-light leading-relaxed tracking-wide">
                        {data.paragraphs.map((paragraph, index) => (
                            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
