import Image from "next/image";
import Link from "next/link";
import { Twitter, Facebook, Linkedin, Instagram, Heart, Youtube, Globe } from "lucide-react";
import { dbConnect } from "@/helpers";
import { Settings } from "@/models";
import { NewsletterForm } from "./NewsletterForm";
import { FooterAccordion } from "./FooterAccordion";

const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
        case 'facebook': return <Facebook className="w-4 h-4" />;
        case 'twitter': return <Twitter className="w-4 h-4" />;
        case 'linkedin': return <Linkedin className="w-4 h-4" />;
        case 'instagram': return <Instagram className="w-4 h-4" />;
        case 'youtube': return <Youtube className="w-4 h-4" />;
        // lucide-react doesn't have tiktok, so we'll fallback to a generic or custom if needed
        default: return <Globe className="w-4 h-4" />;
    }
};

const getHoverClass = (platform: string) => {
    switch (platform?.toLowerCase()) {
        case 'facebook': return 'hover:bg-[#1877F2] hover:border-[#1877F2]';
        case 'twitter': return 'hover:bg-[#1DA1F2] hover:border-[#1DA1F2]';
        case 'linkedin': return 'hover:bg-[#0A66C2] hover:border-[#0A66C2]';
        case 'instagram': return 'hover:bg-[#E1306C] hover:border-[#E1306C]';
        case 'youtube': return 'hover:bg-[#FF0000] hover:border-[#FF0000]';
        case 'tiktok': return 'hover:bg-black hover:border-black';
        default: return 'hover:bg-[#c06b40] hover:border-[#c06b40]';
    }
};

const Footer = async () => {
    const currentYear = new Date().getFullYear();

    let settings: Record<string, any> = {};
    try {
        await dbConnect();
        const settingsDocs = await Settings.find({}).lean();
        settings = settingsDocs.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    } catch (e) { }

    const socialLinks = settings.footer_social_links || [];
    const footerMenus = settings.footer_menus || [];

    return (
        <footer className="gold-gradient gold-bevel pt-6 sm:pt-12 pb-4 sm:pb-8 border-t border-black/10 shadow-[0_-8px_35px_rgba(172,135,23,0.3)]">
            <div className="mx-4 sm:mx-8 lg:mx-12 2xl:mx-auto 2xl:max-w-[1600px] text-gray-950">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10 lg:gap-8 mb-6 sm:mb-10">
                    {/* Column 1: Brand & Newsletter */}
                    <div className="lg:col-span-2 flex flex-col items-start gap-6">
                        <div className="flex items-center gap-3">
                            <Image src="/nav-logo.png" alt="Salaf Official Logo" width={40} height={40} className="filter brightness-0 contrast-200" />
                            <h2 className="text-3xl font-heading font-black text-gray-950 tracking-wide uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">Salaf</h2>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-heading font-bold text-[22px] text-gray-950 uppercase tracking-widest">SUBSCRIBE TO OUR NEWSLETTER:</h3>
                            <div className="space-y-1">
                                <p className="text-gray-950/80 text-[15px] leading-relaxed max-w-sm">
                                    Receive Updates on New Arrivals and Special
                                </p>
                                <p className="text-gray-950/80 text-[15px] leading-relaxed max-w-sm">
                                    Promotions!
                                </p>
                            </div>
                            <div className="text-gray-950/70 text-[14px] flex flex-col gap-1 mt-4">
                                <p>Email: <a href="mailto:contact@salaf.bd" className="font-bold text-gray-950 hover:text-black transition-colors underline decoration-black/20 underline-offset-4">contact@salaf.bd</a></p>
                                <p>Address: Lakshmipur Sadar, Lakshmipur, Bangladesh, 3700</p>
                            </div>
                        </div>

                        {/* Newsletter Input */}
                        <NewsletterForm />

                        <div className="flex items-center gap-4 mt-4">
                            {socialLinks.length > 0 ? (
                                socialLinks.map((link: any, idx: number) => (
                                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-gray-950/80 hover:text-black transition-all hover:border-black/40 bg-white/20 ${getHoverClass(link.platform).replace('hover:bg-', 'hover:text-')}`}>
                                        {getPlatformIcon(link.platform)}
                                    </a>
                                ))
                            ) : null}
                        </div>
                    </div>

                    {/* Links Columns - Responsive Accordion */}
                    <div className="lg:col-span-3 footer-menus-container">
                        <FooterAccordion menus={footerMenus} />
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-black/10 flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-950/75 text-[13px] text-center font-medium">
                        &copy; {currentYear} Salaf. All rights reserved
                    </p>
                    <p className="text-gray-950/70 text-[13px] text-center flex items-center justify-center gap-1 flex-wrap">
                        <span>Developed with</span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline-block mx-0.5" />
                        <span>by</span>
                        <Link href="https://farhansadiq.dev" target="_blank" className="text-gray-950 font-black hover:text-black hover:underline hover:cursor-pointer transition-colors">Farhan Sadiq</Link>
                        <span className="mx-1 text-gray-950/40">|</span>
                        <span className="font-semibold text-gray-950">Special Thanks to Mr Azizul Hakim</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
