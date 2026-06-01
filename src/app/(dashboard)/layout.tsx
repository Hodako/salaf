"use client";

import React from "react";
import {
 LayoutDashboard,
 ShoppingBag,
 User,
 Settings,
 LogOut,
 Heart,
 MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const sidebarItems = [
 { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
 { label: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
 { label: "Wishlist", icon: Heart, href: "/dashboard/wishlist" },
 { label: "Reviews", icon: MessageSquare, href: "/dashboard/reviews" },
 { label: "Profile", icon: User, href: "/dashboard/profile" },
];

import { BottomNav } from "@/components/layout/BottomNav";

import { useState, useEffect } from "react";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetDescription,
 SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const { signOut } = useAuth();
 const router = useRouter();
 const pathname = usePathname();
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 useEffect(() => {
 setIsSidebarOpen(false);
 }, [pathname]);

 const handleSignOut = async () => {
 await signOut();
 router.push("/");
 };

 const SidebarContent = () => (
 <div className="flex flex-col h-full">
 <div className="mb-12">
 <Link href="/" className="inline-block">
 <h2 className="text-2xl font-heading font-medium text-bprimary-dark tracking-widest italic">SALAF</h2>
 </Link>
 </div>

 <nav className="flex-1 space-y-2">
 {sidebarItems.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className={cn( "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group", pathname === item.href ? "text-foreground bg-accent/50 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/30 " )}
 >
 <item.icon className={cn( "w-5 h-5 transition-colors", pathname === item.href ? "text-bprimary-dark " : "group-hover:text-bprimary-dark " )} />
 <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
 </Link>
 ))}
 </nav>

 <div className="pt-8 border-t border-border">
 <Button
 onClick={handleSignOut}
 variant="ghost"
 className="w-full justify-start gap-4 px-6 py-4 rounded-2xl text-red-600/60 hover:text-red-600 hover:bg-red-50 transition-all group"
 >
 <LogOut className="w-5 h-5" />
 <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
 </Button>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen bg-background text-foreground font-lato flex">
 {/* Desktop Sidebar */}
 <aside className="hidden lg:flex w-80 flex-col border-r border-border p-8 sticky top-0 h-screen">
 <SidebarContent />
 </aside>

 {/* Main Content */}
 <main className="flex-1 relative min-w-0">
 {/* Mobile Header */}
 <header className="lg:hidden h-20 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
 <Link href="/" className="inline-block">
 <h2 className="text-xl font-heading font-medium text-bprimary-dark tracking-widest italic">SALAF</h2>
 </Link>
 
 <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
 <SheetTrigger asChild>
 <Button variant="ghost" size="icon" className="text-muted-foreground">
 <LayoutDashboard className="w-6 h-6" />
 </Button>
 </SheetTrigger>
 <SheetContent side="left" className="bg-background border-border p-8 w-80">
 <SheetHeader className="sr-only">
 <SheetTitle>Dashboard Navigation</SheetTitle>
 <SheetDescription>Access your dashboard links</SheetDescription>
 </SheetHeader>
 <SidebarContent />
 </SheetContent>
 </Sheet>
 </header>

 <div className="min-h-screen pb-24 lg:pb-0">
 {children}
 </div>

 <BottomNav />
 </main>
 </div>
 );
}

import { cn } from "@/lib/utils";
