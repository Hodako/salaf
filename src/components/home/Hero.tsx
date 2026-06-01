import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSectionData } from "@/types";

interface HeroProps {
    data: HeroSectionData;
}

export const Hero = ({ data }: HeroProps) => {
    return (
        <section className="relative w-full bg-background overflow-hidden">
            <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4 md:py-8 lg:py-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-2 sm:gap-12 lg:gap-8">

                {/* Text Content - Left Side */}
                <div className="flex flex-col items-start text-left max-w-2xl z-10 w-full lg:w-1/2">
                    <h1
                        className="text-2xl sm:text-5xl lg:text-6xl font-light text-foreground leading-[1.15] tracking-wide mb-2 sm:mb-6"
                        dangerouslySetInnerHTML={{ __html: data.title }}
                    />
                    <p className="text-muted-foreground text-sm sm:text-xl font-light leading-relaxed mb-2 sm:mb-10 max-w-lg">
                        {data.subtitle}
                    </p>
                    <Button className="bg-bprimary-dark hover:bg-bprimary-dark/90 text-white px-4 sm:px-8 py-3 sm:py-6 rounded-md font-heading font-semibold text-sm sm:text-lg transition-colors border-none cursor-pointer hover:scale-105">
                        {data.buttonText}
                    </Button>
                </div>

                {/* Image - Right Side */}
                <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-end z-10 min-h-[150px] sm:min-h-[300px] lg:min-h-[450px] items-center">
                    <div
                        className="relative w-full max-w-sm lg:max-w-[450px] aspect-4/5"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to top, transparent 0%, black 15%, black 100%)',
                            WebkitMaskComposite: 'source-in',
                            maskComposite: 'intersect'
                        }}
                    >
                        <Image
                            src={data.imageUrl}
                            alt={data.buttonText || "Hero Image"}
                            fill
                            className="object-contain scale-[1.05] lg:scale-[1.1] translate-y-2 lg:translate-x-4"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

            </div>

            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-linear-to-r from-background/40 to-transparent pointer-events-none z-0 lg:block hidden"></div>
        </section>
    );
};

export default Hero;
