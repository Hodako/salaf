"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
    ChevronRight, 
    MapPin, 
    Phone, 
    User, 
    ShoppingBag, 
    ArrowLeft, 
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Banknote
} from "lucide-react";
import { useAuth, useCart, useDeliveryZones, useWishlist } from "@/hooks";
import { IDeliveryZone } from "@/types/delivery-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "@/lib/axios";
import {
    allDivision,
    districtsOf,
    upazilaNamesOf,
} from "@bangladeshi/bangladesh-address/build/src/index";
import bdLocationData from "bangladesh-location-data/english.json";
import { logBeginCheckout, logAddShippingInfo, logAddPaymentInfo, logPurchase } from "@/lib/gtm";
import { FcGoogle } from "react-icons/fc";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, loading } = useAuth();
    const { cart, totalPrice, totalItems, clearCart } = useCart();
    const { removeFromWishlist } = useWishlist();
    const { data: zones = [] } = useDeliveryZones();
 
    useEffect(() => {
        document.body.classList.add('hide-footer-menus');
        return () => {
            document.body.classList.remove('hide-footer-menus');
        };
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        division: "",
        district: "",
        upazila: "",
        area: "",
        customArea: "",
        streetAddress: "",
        postCode: "0000",
    });

    // Helper to get real Bangladeshi Unions / Sectors / Wards based on selected Upazila
    const getAreasOf = (upazilaName: string) => {
        if (!upazilaName) return [];
        
        const explicitUpazilaMap: Record<string, string> = {
            'shantiganj': 'southsunamganj',
            'shanthiganj': 'southsunamganj',
            'comillasadarsouth': 'sadarsouth',
            'gazipursadarjoydebpur': 'gazipursadar',
            'goalandaghat': 'goalanda',
            'narundipoliceic': 'jamalpursadar',
            'madhyanagar': 'dharmapasha',
            'shahbazpurtown': 'sarail',
            'eidgaon': 'coxsbazarsadar',
            'tongi': 'gazipursadar',
            'siddirgonj': 'narayanganjsadar',
            'fultola': 'fultola',
            'phultala': 'fultola'
        };

        const normalize = (name: string) => {
            if (!name) return "";
            let str = name.toLowerCase().trim();
            
            // Clean spaces and punctuation first for map lookup
            str = str.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

            // Apply explicit mappings
            if (explicitUpazilaMap[str]) {
                str = explicitUpazilaMap[str];
            }

            // Remove helper suffixes
            str = str.replace(/upazila/g, '')
                     .replace(/thana/g, '')
                     .replace(/sadar/g, '');

            // Direction mappings
            str = str.replace(/north/g, 'uttar')
                     .replace(/south/g, 'dakkhin')
                     .replace(/dakshin/g, 'dakkhin')
                     .replace(/dakhin/g, 'dakkhin')
                     .replace(/east/g, 'purbo')
                     .replace(/west/g, 'poscim');

            // Transliteration normalizations
            str = str.replace(/ph/g, 'f')
                     .replace(/f/g, 'ph')
                     .replace(/ou/g, 'u')
                     .replace(/o/g, 'u')
                     .replace(/y/g, 'i')
                     .replace(/j/g, 'z')
                     .replace(/sh/g, 's')
                     .replace(/kh/g, 'h')
                     .replace(/gh/g, 'h')
                     .replace(/ch/g, 'c')
                     .replace(/c/g, 'k');

            return str;
        };

        let foundUpazilaId: number | null = null;
        const upazilasObject = bdLocationData.upazilas_en as Record<string, Array<{ value: number, title: string }>>;
        const unionsObject = bdLocationData.unions_en as Record<string, Array<{ value: number, title: string }>>;

        // 1. Try exact match
        for (const districtId of Object.keys(upazilasObject)) {
            const upazilasList = upazilasObject[districtId];
            const match = upazilasList.find(
                u => u.title.toLowerCase() === upazilaName.toLowerCase()
            );
            if (match) {
                foundUpazilaId = match.value;
                break;
            }
        }

        // 2. Try normalized match
        if (!foundUpazilaId) {
            const normUpazila = normalize(upazilaName);
            for (const districtId of Object.keys(upazilasObject)) {
                const upazilasList = upazilasObject[districtId];
                const match = upazilasList.find(
                    u => normalize(u.title) === normUpazila
                );
                if (match) {
                    foundUpazilaId = match.value;
                    break;
                }
            }
        }

        // 3. Try Levenshtein match (fallback edit distance)
        if (!foundUpazilaId) {
            const getLevenshteinDistance = (a: string, b: string) => {
                const matrix = [];
                for (let i = 0; i <= b.length; i++) matrix[i] = [i];
                for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                            matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                            matrix[i][j] = Math.min(
                                matrix[i - 1][j - 1] + 1,
                                matrix[i][j - 1] + 1,
                                matrix[i - 1][j] + 1
                            );
                        }
                    }
                }
                return matrix[b.length][a.length];
            };

            let bestMatch = null;
            let minDistance = 999;
            const normUpazila = normalize(upazilaName);
            
            for (const districtId of Object.keys(upazilasObject)) {
                const upazilasList = upazilasObject[districtId];
                for (const u of upazilasList) {
                    const distScore = getLevenshteinDistance(normalize(u.title), normUpazila);
                    if (distScore < minDistance) {
                        minDistance = distScore;
                        bestMatch = u;
                    }
                }
            }

            if (bestMatch && minDistance <= 2) {
                foundUpazilaId = bestMatch.value;
            }
        }
        
        if (foundUpazilaId) {
            const unionsList = unionsObject[foundUpazilaId] || [];
            const titles = unionsList.map(un => un.title);
            if (titles.length > 0) {
                // Filter out duplicates and clean titles
                const uniqueTitles = Array.from(new Set(titles));
                return [...uniqueTitles, "Other"];
            }
        }

        // Generic fallback unions for other Upazilas in Bangladesh if not found
        return [
            `${upazilaName} Union 1`,
            `${upazilaName} Union 2`,
            "Other"
        ];
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Address selection states
    const divisions = allDivision();
    const districts = formData.division ? districtsOf(formData.division) : [];
    const upazilas = formData.district ? upazilaNamesOf(formData.district) : [];

    // Calculate Shipping
    const getShippingCost = () => {
        const activeZones = zones.filter((z: any) => z.isActive);
        
        // Find matching zones
        const matchingZones = activeZones.filter((zone: IDeliveryZone) => {
            if (zone.upazila && zone.upazila !== formData.upazila) return false;
            if (zone.district && zone.district !== formData.district) return false;
            if (zone.division && zone.division !== formData.division) return false;
            return true;
        });

        if (matchingZones.length === 0) return 0; // Default free if no zone matches

        // Sort by priority (desc) and pick the first
        const bestZone = matchingZones.sort((a: IDeliveryZone, b: IDeliveryZone) => (b.priority || 0) - (a.priority || 0))[0];

        if ((bestZone.freeDeliveryThreshold ?? 0) > 0 && totalPrice >= (bestZone.freeDeliveryThreshold ?? 0)) {
            return 0;
        }

        return bestZone.deliveryFee;
    };

    const shippingCost = getShippingCost();
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const grandTotal = totalPrice + shippingCost - discountAmount;

    useEffect(() => {
        if (!loading && isAdmin) {
            toast.error("Administrators cannot place orders");
            router.push("/");
        }
    }, [loading, isAdmin, router]);

    useEffect(() => {
        if (loading) return;
        if (!isAdmin && cart.length > 0) {
            logBeginCheckout(cart, totalPrice);
        }
    }, [loading, isAdmin, cart.length, totalPrice]);

    // Track Shipping Info
    const [hasLoggedShipping, setHasLoggedShipping] = useState(false);
    useEffect(() => {
        if (formData.division && formData.district && formData.upazila && !hasLoggedShipping) {
            logAddShippingInfo(cart, totalPrice, "Standard");
            setHasLoggedShipping(true);
        }
    }, [formData.division, formData.district, formData.upazila, hasLoggedShipping, cart, totalPrice]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phoneNumber: (user as any).phoneNumber || prev.phoneNumber,
                division: (user as any).address?.division || prev.division,
                district: (user as any).address?.district || prev.district,
                upazila: (user as any).address?.upazila || prev.upazila,
                streetAddress: (user as any).address?.streetAddress || prev.streetAddress,
                postCode: (user as any).address?.postCode || "0000",
            }));
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        );
    }

    if (isAdmin) return null;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-8">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-heading font-medium text-foreground mb-4">Your bag is empty</h1>
                <p className="text-muted-foreground mb-8 max-w-md">You haven't added any premium fragrances to your bag yet.</p>
                <Button 
                    onClick={() => router.push("/shop")}
                    className="bg-bprimary text-black font-bold px-12 rounded-full h-14 uppercase tracking-widest"
                >
                    Return to Shop
                </Button>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Reset dependent fields
            if (name === 'division') {
                newData.district = "";
                newData.upazila = "";
                newData.area = "";
                newData.customArea = "";
            } else if (name === 'district') {
                newData.upazila = "";
                newData.area = "";
                newData.customArea = "";
            } else if (name === 'upazila') {
                newData.area = "";
                newData.customArea = "";
            }
            return newData;
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setIsValidatingCoupon(true);
        try {
            const { data } = await axios.post("/checkout/validate-coupon", {
                code: couponInput,
                cartTotal: totalPrice
            });
            setAppliedCoupon(data);
            toast.success(`Coupon "${data.couponCode}" applied!`);
        } catch (error: any) {
            setAppliedCoupon(null);
            toast.error(error.response?.data?.message || "Invalid coupon code");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedArea = formData.area === "Other" ? formData.customArea : formData.area;

        // Validation
        if (!formData.phoneNumber || !formData.division || !formData.district || !formData.upazila || !selectedArea || !formData.streetAddress) {
            toast.error("Please fill in all required shipping information");
            return;
        }

        const fullStreetAddress = `Area/Village/Union: ${selectedArea}, ${formData.streetAddress}`;

        logAddPaymentInfo(cart, totalPrice, "Cash on Delivery");
        setIsSubmitting(true);
        try {
            // Create Order
            const { data: order } = await axios.post("/orders", { 
                items: cart.map(item => ({
                    product: item.productId,
                    productName: item.productName,
                    sku: item.sku || "N/A",
                    price: item.price,
                    quantity: item.quantity,
                    featuredImage: item.featuredImage,
                    volume: item.volume,
                    variantType: item.variantType
                })),
                shippingAddress: {
                    division: formData.division,
                    district: formData.district,
                    upazila: formData.upazila,
                    postCode: "0000",
                    streetAddress: fullStreetAddress,
                },
                phoneNumber: formData.phoneNumber,
                name: formData.name,
                email: formData.email,
                subtotal: totalPrice,
                shippingFee: shippingCost,
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.couponCode,
                totalAmount: grandTotal
            });

            logPurchase(order);
            toast.success("Order placed successfully! Thank you for choosing Salaf.");
            
            // Cleanup Wishlist for purchased items
            if (isAuthenticated) {
                cart.forEach(item => removeFromWishlist(item.productId));
            }
            
            sessionStorage.setItem("lastOrder", JSON.stringify(order));
            
            clearCart();
            router.push("/thank-you");
        } catch (error) {
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-2 md:pt-24 pb-10 md:pb-12 px-2 sm:px-6">
            <div className="container mx-auto max-w-6xl">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 md:mb-6 group text-xs md:text-sm"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Left: Shipping Form */}
                    <div className="lg:col-span-7 space-y-4 md:space-y-6">
                        <header className="space-y-3 md:space-y-4">
                            <div>
                                <h1 className="text-2xl md:text-5xl font-heading font-medium text-foreground mb-1 md:mb-4 leading-tight">
                                    Shipping <span className="text-bprimary">Details</span>
                                </h1>
                                <p className="text-xs md:text-base text-muted-foreground">Provide your delivery information to complete the order.</p>
                            </div>

                            {!isAuthenticated && (
                                <div className="bg-bprimary/5 border border-bprimary/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h3 className="text-sm md:text-lg font-medium text-foreground">Already have an account?</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground">Sign in to automatically fill your details and track orders.</p>
                                    </div>
                                    <Button 
                                        onClick={() => router.push(`/auth?returnUrl=/checkout`)}
                                        className="bg-white text-black hover:bg-gray-200 rounded-full h-10 md:h-12 px-5 md:px-8 font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-black/5 text-xs md:text-sm"
                                    >
                                        <FcGoogle className="w-5 h-5 shrink-0" />
                                        Sign in with Google
                                    </Button>
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="relative flex items-center py-1 md:py-4">
                                    <div className="grow border-t border-border"></div>
                                    <span className="shrink mx-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">or continue as guest</span>
                                    <div className="grow border-t border-border"></div>
                                </div>
                            )}
                        </header>

                        <form onSubmit={handleSubmitOrder} className="space-y-4 md:space-y-8">
                            <div className="bg-muted/50 border border-border rounded-2xl md:rounded-[2rem] p-4 md:p-8 space-y-4 md:space-y-6">
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-2 md:gap-3 text-bprimary mb-2 md:mb-4">
                                        <User className="w-5 h-5" />
                                        <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Personal Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">Full Name *</label>
                                            <Input 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Your Name"
                                                className="bg-muted/50 border-border rounded-xl md:rounded-2xl h-11 md:h-14 text-foreground placeholder:text-muted-foreground focus:border-bprimary/50 transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">Email Address *</label>
                                            <Input 
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your@email.com"
                                                className="bg-muted/50 border-border rounded-xl md:rounded-2xl h-11 md:h-14 text-foreground placeholder:text-muted-foreground focus:border-bprimary/50 transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">Phone Number *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input 
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="01XXXXXXXXX"
                                                    className="bg-muted/50 border-border rounded-xl md:rounded-2xl h-11 md:h-14 pl-11 md:pl-12 text-foreground placeholder:text-muted-foreground focus:border-bprimary/50 transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 md:pt-6 border-t border-border space-y-4 md:space-y-5">
                                    <div className="flex items-center gap-2 md:gap-3 text-bprimary mb-2 md:mb-4">
                                        <MapPin className="w-5 h-5" />
                                        <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Delivery Address</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">Division *</label>
                                            <select 
                                                name="division"
                                                value={formData.division}
                                                onChange={handleInputChange}
                                                className="w-full bg-muted/50 border border-border rounded-xl md:rounded-2xl h-11 md:h-14 px-4 md:px-5 text-foreground focus:outline-none focus:border-bprimary/50 transition-colors appearance-none text-sm md:text-base"
                                                required
                                            >
                                                <option value="" className="bg-white">Select Division</option>
                                                {divisions.map(div => (
                                                    <option key={div} value={div} className="bg-white">{div}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">District *</label>
                                            <select 
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                disabled={!formData.division}
                                                className="w-full bg-muted/50 border border-border rounded-xl md:rounded-2xl h-11 md:h-14 px-4 md:px-5 text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-bprimary/50 transition-colors appearance-none text-sm md:text-base"
                                                required
                                            >
                                                <option value="" className="bg-white">Select District</option>
                                                {districts.map(dist => (
                                                    <option key={dist} value={dist} className="bg-white">{dist}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 md:space-y-2">
                                            <label className="text-xs md:text-sm text-muted-foreground ml-1">Upazila *</label>
                                            <select 
                                                name="upazila"
                                                value={formData.upazila}
                                                onChange={handleInputChange}
                                                disabled={!formData.district}
                                                className="w-full bg-muted/50 border border-border rounded-xl md:rounded-2xl h-11 md:h-14 px-4 md:px-5 text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-bprimary/50 transition-colors appearance-none text-sm md:text-base"
                                                required
                                            >
                                                <option value="" className="bg-white">Select Upazila</option>
                                                {upazilas.map(upz => (
                                                    <option key={upz} value={upz} className="bg-white">{upz}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Area / Village / Union Field */}
                                    <div className="space-y-1.5 md:space-y-2">
                                        <label className="text-xs md:text-sm text-muted-foreground ml-1">Area / Village / Union *</label>
                                        <select 
                                            name="area"
                                            value={formData.area}
                                            onChange={handleInputChange}
                                            disabled={!formData.upazila}
                                            className="w-full bg-muted/50 border border-border rounded-xl md:rounded-2xl h-11 md:h-14 px-4 md:px-5 text-foreground disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-bprimary/50 transition-colors appearance-none text-sm md:text-base"
                                            required
                                        >
                                            <option value="" className="bg-white">Select Area / Village / Union</option>
                                            {getAreasOf(formData.upazila).map(ar => (
                                                <option key={ar} value={ar} className="bg-white">{ar}</option>
                                            ))}
                                        </select>

                                        {formData.area === "Other" && (
                                            <Input 
                                                name="customArea"
                                                value={formData.customArea}
                                                onChange={handleInputChange}
                                                placeholder="Type your Area, Village, or Union name manually..."
                                                className="bg-muted/50 border-border rounded-xl md:rounded-2xl h-11 md:h-14 text-foreground placeholder:text-muted-foreground mt-2"
                                                required
                                            />
                                        )}
                                    </div>

                                    {/* Street Address */}
                                    <div className="space-y-1.5 md:space-y-2">
                                        <label className="text-xs md:text-sm text-muted-foreground ml-1">Street Address (House No / Detail Location) *</label>
                                        <Input 
                                            name="streetAddress"
                                            value={formData.streetAddress}
                                            onChange={handleInputChange}
                                            placeholder="House No, Road No, Sector, Block..."
                                            className="bg-muted/50 border-border rounded-xl md:rounded-2xl h-11 md:h-14 text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 md:h-16 bg-bprimary text-black font-black uppercase tracking-[0.18em] md:tracking-[0.3em] rounded-full hover:scale-[1.01] transition-all duration-500 shadow-xl shadow-bprimary/10 group text-xs md:text-sm"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Confirm Order
                                        <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-4 md:space-y-8">
                            <div className="bg-muted/50 border border-border rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-4 md:space-y-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-bprimary/5 blur-[80px] rounded-full" />
                                
                                <div className="flex items-center gap-3 text-bprimary mb-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Order Summary</h2>
                                </div>

                                <div className="space-y-4 md:space-y-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {cart.map((item) => (
                                        <div key={`${item.productId}-${item.variationIdx}`} className="flex gap-3 md:gap-4 group">
                                            <div className="relative w-16 md:w-20 aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-muted/50 border border-border shrink-0">
                                                <Image 
                                                    src={item.featuredImage}
                                                    alt={item.productName}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h3 className="text-foreground font-medium line-clamp-1 group-hover:text-bprimary transition-colors">
                                                    {item.productName}
                                                </h3>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                                    {item.volume} × {item.quantity}
                                                </p>
                                                <p className="text-bprimary text-sm font-medium mt-2">
                                                    ৳ {(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-5 md:pt-8 border-t border-border space-y-4 md:space-y-6">
                                    {/* Coupon Section */}
                                    <div className="space-y-2 md:space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Have a coupon?</label>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Enter code" 
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                className="bg-muted/50 border-border rounded-xl h-10 md:h-12 uppercase"
                                                disabled={!!appliedCoupon}
                                            />
                                            {appliedCoupon ? (
                                                <Button 
                                                    type="button"
                                                    onClick={() => {
                                                        setAppliedCoupon(null);
                                                        setCouponInput("");
                                                    }}
                                                    variant="ghost"
                                                    className="h-10 md:h-12 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    Remove
                                                </Button>
                                            ) : (
                                                <Button 
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponInput || isValidatingCoupon}
                                                    className="bg-white text-black hover:bg-gray-200 h-10 md:h-12 px-4 md:px-6 rounded-xl font-bold"
                                                >
                                                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                                </Button>
                                            )}
                                        </div>
                                        {appliedCoupon && (
                                            <p className="text-[10px] text-emerald-500 font-medium">
                                                Coupon applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `৳${appliedCoupon.discountValue}`} discount.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 md:space-y-4 pt-1 md:pt-2 text-sm md:text-base">
                                        <div className="flex justify-between text-muted-foreground italic">
                                            <span>Items ({totalItems})</span>
                                            <span>৳ {totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-muted-foreground italic">
                                            <span>Shipping</span>
                                            {formData.division && formData.district && formData.upazila ? (
                                                <span className={shippingCost === 0 ? "text-bprimary uppercase text-xs font-bold tracking-widest" : "text-foreground font-mono"}>
                                                    {shippingCost === 0 ? "Free" : `৳ ${shippingCost.toLocaleString()}`}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter text-right">
                                                    Select address <br/> for shipping
                                                </span>
                                            )}
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-emerald-500 italic">
                                                <span>Discount ({appliedCoupon.couponCode})</span>
                                                <span>- ৳ {discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-border">
                                            <span className="text-foreground text-base md:text-lg font-medium">Total Amount</span>
                                            <span className="text-xl md:text-2xl font-heading font-medium text-bprimary">
                                                ৳ {grandTotal.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="bg-bprimary/5 border border-bprimary/15 rounded-2xl p-4 flex gap-3.5 items-center shadow-xs">
                                    <div className="w-10 h-10 rounded-full bg-bprimary/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <ShieldCheck className="w-5.5 h-5.5 text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[12px] font-black uppercase tracking-wider text-gray-900 leading-none mb-1">Secure Transaction</p>
                                        <p className="text-[10px] text-gray-900/70 font-medium leading-tight">100% encrypted secure shopping network powered by Salaf.</p>
                                    </div>
                                </div>

                                <div className="bg-bprimary/5 border border-bprimary/15 rounded-2xl p-4 flex gap-3.5 items-center shadow-xs">
                                    <div className="w-10 h-10 rounded-full bg-bprimary/20 flex items-center justify-center shrink-0 shadow-inner">
                                        <Banknote className="w-5.5 h-5.5 text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[12px] font-black uppercase tracking-wider text-gray-900 leading-none mb-1">Cash on Delivery</p>
                                        <p className="text-[10px] text-gray-900/70 font-medium leading-tight">Available nationwide. Pay securely upon receiving your fragrance package.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-card border border-border rounded-[3rem] p-8 md:p-12 max-w-lg w-full text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-bprimary/20 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="w-12 h-12 text-bprimary" />
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-heading font-medium text-foreground">Order <span className="text-bprimary">Confirmed!</span></h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Thank you for choosing Salaf. Your premium fragrances will be delivered within 2-3 business days. 
                                We have sent a confirmation details to <span className="text-foreground font-medium">{formData.email}</span>.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <Button 
                                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/shop")}
                                className="h-14 bg-bprimary text-black font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform duration-300"
                            >
                                {isAuthenticated ? "Go to Dashboard" : "Continue Shopping"}
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="h-14 border-border text-foreground font-bold uppercase tracking-[0.2em] rounded-full hover:bg-muted transition-colors"
                            >
                                Return Home
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
