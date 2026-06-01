"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users as UsersIcon,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    Tags,
    FolderTree,
    Layers,
    Bell,
    MapPin,
    Ticket,
    FileText,
    Navigation,
    LayoutTemplate,
    Mail,
    Megaphone,
    Star,
    Send,
    Award,
    Smartphone
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";

// Base admin path - accessible via /whoisadmin/admin/ rewrite
const ADMIN_BASE = "/whoisadmin/admin";

const NAV_ITEMS = [
    { label: "Dashboard", href: `${ADMIN_BASE}/dashboard`, icon: LayoutDashboard },
    { label: "Orders", href: `${ADMIN_BASE}/orders`, icon: ShoppingBag },
    { label: "Products", href: `${ADMIN_BASE}/products`, icon: Package },
    { label: "Categories", href: `${ADMIN_BASE}/categories`, icon: Layers },
    { label: "Brands", href: `${ADMIN_BASE}/brands`, icon: Award },
    { label: "Collections", href: `${ADMIN_BASE}/collections`, icon: FolderTree },
    { label: "Tags", href: `${ADMIN_BASE}/tags`, icon: Tags },
    { label: "Coupons", href: `${ADMIN_BASE}/coupons`, icon: Ticket },
    { label: "Newsletter", href: `${ADMIN_BASE}/newsletter`, icon: Mail },
    { label: "Product Reviews", href: `${ADMIN_BASE}/reviews`, icon: Star },
    { label: "External Reviews", href: `${ADMIN_BASE}/external-reviews`, icon: Send },
    { label: "Notices", href: `${ADMIN_BASE}/notices`, icon: Megaphone },
    { label: "Pages & Templates", href: `${ADMIN_BASE}/pages`, icon: LayoutTemplate },
    { label: "Mobile Section", href: `${ADMIN_BASE}/mobile`, icon: Smartphone },
    { label: "Footer Navigation", href: `${ADMIN_BASE}/navigation`, icon: Navigation },
    { label: "Delivery Zones", href: `${ADMIN_BASE}/delivery-zones`, icon: MapPin },
    { label: "Users", href: `${ADMIN_BASE}/users`, icon: UsersIcon },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("admin-sidebar-collapsed");
        if (saved) setIsCollapsed(saved === "true");
    }, []);

    // Defense-in-depth security guard: redirect unauthenticated or non-admin users
    useEffect(() => {
        if (isMounted && !loading) {
            if (!user) {
                router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
            } else if (user.role !== "admin") {
                router.push("/dashboard");
            }
        }
    }, [user, loading, isMounted, router, pathname]);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("admin-sidebar-collapsed", String(newState));
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            toast.info("Logged out successfully");
            router.push("/");
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    if (!isMounted || loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c06b40]"></div>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full bg-[#050505] text-white">
            {/* Brand Header */}
            <div className={cn(
                "h-16 flex items-center border-b border-white/5 shrink-0 transition-all duration-300 px-6",
                !isMobile && isCollapsed && "px-4 justify-center"
            )}>
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#c06b40] flex items-center justify-center shrink-0 shadow-lg shadow-[#c06b40]/20">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <span className="text-xl font-heading font-medium tracking-widest text-white">
                            SALAF
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation Links - Scrollable */}
            <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-3 scrollbar-hide">
                {NAV_ITEMS.map((item) => {
                    // Match both /whoisadmin/admin/* (rewrite source) and /admin/* (internal)
                    const isActive = pathname.startsWith(item.href) || pathname.startsWith(item.href.replace(ADMIN_BASE, '/admin'));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-[#c06b40] text-white shadow-lg shadow-[#c06b40]/10"
                                    : "text-gray-400 hover:text-white hover:bg-white/5",
                                !isMobile && isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0 transition-transform duration-200",
                                !isActive && "group-hover:scale-110",
                                isActive && "text-white"
                            )} />
                            {(!isCollapsed || isMobile) && (
                                <span className="font-medium text-sm tracking-wide">{item.label}</span>
                            )}
                            {isActive && !isMobile && isCollapsed && (
                                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions - Sticky/Static at bottom */}
            <div className="p-3 border-t border-white/5 shrink-0 flex flex-col gap-1.5 bg-[#050505]">
                <Link
                    href={`${ADMIN_BASE}/settings`}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200",
                        (pathname === `${ADMIN_BASE}/settings` || pathname === "/admin/settings") && "bg-white/5 text-white",
                        !isMobile && isCollapsed && "justify-center px-0"
                    )}
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    {(!isCollapsed || isMobile) && <span className="text-sm font-medium tracking-wide">Settings</span>}
                </Link>
                <button
                    onClick={handleSignOut}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 text-left",
                        !isMobile && isCollapsed && "justify-center px-0"
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {(!isCollapsed || isMobile) && <span className="text-sm font-medium tracking-wide">Sign Out</span>}
                </button>

                {!isMobile && (
                    <button
                        onClick={toggleCollapse}
                        className="mt-2 flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all duration-300"
                    >
                        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#050505] text-white font-lato">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "border-r border-white/5 hidden md:flex flex-col transition-all duration-500 ease-in-out z-40 relative shadow-2xl shadow-black",
                isCollapsed ? "w-20" : "w-72"
            )}>
                <SidebarContent />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c06b40]/5 blur-[120px] -z-10 rounded-full" />

                {/* Top Header */}
                <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/60 backdrop-blur-xl z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 bg-[#050505] border-white/10">
                                <SheetHeader className="hidden">
                                    <SheetTitle>Navigation</SheetTitle>
                                </SheetHeader>
                                <SidebarContent isMobile />
                            </SheetContent>
                        </Sheet>

                        <div className="flex flex-col">
                            <div className="text-[10px] text-[#c06b40] font-bold uppercase tracking-[0.2em] mb-0.5">Admin Portal</div>
                            <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                {pathname.split('/').filter(Boolean).filter(p => p !== 'whoisadmin').map((part, i, arr) => (
                                    <span key={i} className="flex items-center gap-2">
                                        <span className={cn("capitalize", i === arr.length - 1 ? "text-white" : "text-gray-500")}>
                                            {part.replace(/-/g, ' ')}
                                        </span>
                                        {i < arr.length - 1 && <span className="text-[10px] text-gray-700">/</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c06b40] rounded-full border-2 border-[#050505]" />
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-bold text-white tracking-tight">
                                    {user?.name || "Dev Mode"}
                                </span>
                                <span className="text-[9px] text-[#c06b40] font-bold uppercase tracking-widest">
                                    {user?.role === 'admin' ? 'Super Admin' : '⚡ Dev Access'}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group cursor-pointer hover:border-[#c06b40]/50 transition-all duration-300 relative">
                                {user?.image ? (
                                    <img 
                                        src={user.image} 
                                        alt={user.name || "Admin"} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-[#c06b40] group-hover:scale-110 transition-transform">
                                        {user?.name?.[0]?.toUpperCase() || "D"}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Scroll Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative scrollbar-hide">
                    <div className="max-w-7xl mx-auto w-full pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
