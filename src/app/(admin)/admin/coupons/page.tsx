"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Loader2, Ticket, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminCoupons, useDeleteCoupon } from "@/hooks/useAdminCoupons";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminCouponsPage() {
    const { data: coupons = [], isLoading, error } = useAdminCoupons();
    const { mutateAsync: deleteCoupon } = useDeleteCoupon();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteCoupon(id);
            toast.success("Coupon deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete coupon");
        }
    };

    const handleEdit = (coupon: any) => {
        setEditingCoupon(coupon);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingCoupon(null);
        setIsFormOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-medium tracking-wide text-white mb-2">Coupons</h1>
                    <p className="text-gray-400">Manage discounts and promotional offers.</p>
                </div>
                <Button 
                    onClick={handleCreate}
                    className="bg-white text-black hover:bg-gray-200 rounded-full px-6 flex items-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" /> Add Coupon
                </Button>
            </div>

            {/* List Area */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-bprimary" />
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <p>Failed to load coupons.</p>
                        <p className="text-sm opacity-70 mt-2">{(error as any).message}</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-500 text-center">
                        <Ticket className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg text-white mb-2">No coupons found</p>
                        <p className="text-sm mb-6">Create your first discount code to boost sales.</p>
                        <Button onClick={handleCreate} variant="link" className="text-bprimary font-medium hover:underline p-0 h-auto">
                            Add Coupon
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Coupon</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usage</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Validity</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {coupons.map((coupon: any) => {
                                    const isExpired = new Date(coupon.validUntil) < new Date();
                                    const isUsageReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
                                    const isActive = coupon.isActive && !isExpired && !isUsageReached;

                                    return (
                                        <tr key={coupon._id} className="hover:bg-white/1 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-bprimary transition-colors uppercase tracking-widest">{coupon.code}</span>
                                                    <span className="text-xs text-gray-500 line-clamp-1">{coupon.description || "No description"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-white">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `৳${coupon.discountValue} Off`}
                                                    </span>
                                                    {coupon.maxDiscountAmount && (
                                                        <span className="text-[10px] text-gray-500">Up to ৳{coupon.maxDiscountAmount}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-white">{coupon.usedCount} / {coupon.usageLimit || "∞"}</span>
                                                    <span className="text-[10px] text-gray-500">Limit: {coupon.maxUsesPerUser || "∞"} per user</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                <div className="flex flex-col">
                                                    <span>From: {new Date(coupon.validFrom).toLocaleDateString()}</span>
                                                    <span>Until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                                                        <XCircle className="w-3 h-3 mr-1" /> {isExpired ? "Expired" : isUsageReached ? "Limit Reached" : "Inactive"}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(coupon)}
                                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit Coupon"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                                title="Delete Coupon"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                                    Are you absolutely sure?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-gray-400">
                                                                    This action cannot be undone. This will permanently delete the coupon
                                                                    <span className="text-white font-medium uppercase"> "{coupon.code}" </span>
                                                                    and it will no longer be usable by customers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(coupon._id)}
                                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                                >
                                                                    Delete Coupon
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Coupon Form Sheet */}
            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                <SheetContent className="bg-[#050505] border-white/5 text-white w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-2xl font-medium">{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</SheetTitle>
                        <SheetDescription className="text-gray-500">
                            Configure discount settings and usage restrictions.
                        </SheetDescription>
                    </SheetHeader>
                    <CouponForm 
                        initialData={editingCoupon} 
                        onSuccess={() => setIsFormOpen(false)} 
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
