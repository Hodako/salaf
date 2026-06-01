import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

// Defer heavy client-side UI on landing pages to improve perceived first paint.
// Note: We keep SSR enabled (default) since Server Components cannot use `ssr: false`.
const Navbar = dynamic(() => import("@/components/layout/Navbar"), {
  loading: () => <div className="h-20 md:h-24" />,
});

const CartSidebar = dynamic(() => import("@/components/layout/CartSidebar").then(m => m.CartSidebar), {
  loading: () => null,
});

const WishlistSidebar = dynamic(
  () => import("@/components/layout/WishlistSidebar").then(m => m.WishlistSidebar),
  { loading: () => null }
);


const BottomNav = dynamic(() => import("@/components/layout/BottomNav").then(m => m.BottomNav), {
  loading: () => null,
});

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <WishlistSidebar />
            <main>
                {children}
            </main>
            <Footer />
            <BottomNav />
        </>
    );
};

export default LandingLayout;