import Image from "next/image";
import { AboutSectionData } from "@/types";

interface AboutUsProps {
    data: AboutSectionData;
}

export const AboutUs = ({ data }: AboutUsProps) => {
    return (
        <section className="relative w-full overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[350px] lg:min-h-[700px] py-4 sm:py-10 px-3 sm:px-6">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={data.bgImageUrl}
                    alt="Salaf About Background"
                    fill
                    className="object-cover object-center opacity-40 mix-blend-multiply"
                    priority={false}
                    sizes="100vw"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-2 sm:space-y-8">
                <h2
                    className="text-2xl sm:text-5xl font-heading font-medium text-bprimary-dark tracking-wide"
                    dangerouslySetInnerHTML={{ __html: data.title }}
                />

                <div
                    className="text-muted-foreground text-xs sm:text-[16px] lg:text-[17px] font-light leading-relaxed tracking-wide space-y-2 sm:space-y-4 max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: data.description }}
                />
            </div>

            {/* Theme-aware gradient overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background opacity-80 z-0 pointer-events-none"></div>
            <div className="absolute inset-0 bg-background/20 z-0 pointer-events-none"></div>
        </section>
    );
};
