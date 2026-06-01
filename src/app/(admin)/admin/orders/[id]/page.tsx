"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
    ChevronLeft,
    Calendar,
    User,
    MapPin,
    Phone,
    Mail,
    ShoppingBag,
    Truck,
    CreditCard,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const statusColors: any = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
    const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);
    const [pendingPayment, setPendingPayment] = React.useState<string | null>(null);

    const { data: order, isLoading } = useQuery({
        queryKey: ["admin-order", id],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/orders/${id}`);
            return data;
        }
    });

    const updateOrder = useMutation({
        mutationFn: async ({ status, paymentStatus }: any) => {
            const { data } = await axios.patch(`/admin/orders/${id}`, { status, paymentStatus });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] }); // Invalidate dashboard too
            toast.success("Order updated successfully");
            setIsStatusModalOpen(false);
            setIsPaymentModalOpen(false);
        },
        onError: () => {
            toast.error("Failed to update order");
        }
    });

    const handleStatusUpdate = (status: string) => {
        setPendingStatus(status);
        setIsStatusModalOpen(true);
    };

    const handlePaymentUpdate = (paymentStatus: string) => {
        setPendingPayment(paymentStatus);
        setIsPaymentModalOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (pendingStatus) {
            updateOrder.mutate({ status: pendingStatus });
        }
    };

    const confirmPaymentUpdate = () => {
        if (pendingPayment) {
            updateOrder.mutate({ paymentStatus: pendingPayment });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin mb-4" />
                <p className="text-gray-500 italic">Unboxing order details...</p>
            </div>
        );
    }

    if (!order) return <div className="p-20 text-center text-gray-500">Order not found</div>;

    const { user } = order;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Confirmation Modals */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>Update Order Status?</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to change the status to <span className="text-bprimary font-bold">{pendingStatus}</span>?
                            {pendingStatus === "Cancelled" && (
                                <p className="mt-2 text-red-400 font-medium">⚠️ Marking as Cancelled will automatically set payment to Unpaid.</p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-3">
                        <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={confirmStatusUpdate}
                            disabled={updateOrder.isPending}
                            className="bg-bprimary text-black font-bold rounded-xl px-8"
                        >
                            {updateOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>Update Payment Status?</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Set payment status to <span className="text-bprimary font-bold">{pendingPayment}</span> for this order?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-3">
                        <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={confirmPaymentUpdate}
                            disabled={updateOrder.isPending}
                            className="bg-bprimary text-black font-bold rounded-xl px-8"
                        >
                            {updateOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Orders
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-heading font-medium text-white">
                            Order <span className="text-bprimary">#{order._id.slice(-8).toUpperCase()}</span>
                        </h1>
                        <Badge className={cn(statusColors[order.status], "px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest")}>
                            {order.status}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-lg border",
                            order.paymentStatus === "Paid" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                        )}>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{order.paymentStatus}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Status Update Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-6 gap-2 hover:text-white">
                                <Truck className="w-4 h-4 text-bprimary" />
                                <span>Update Status</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#111] border-white/10 text-white rounded-xl w-48">
                            <DropdownMenuLabel className="text-[10px] uppercase text-gray-500 tracking-widest p-3">Workflow State</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                                <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusUpdate(s)}
                                    className={cn(
                                        "p-3 cursor-pointer hover:bg-white/5 transition-colors",
                                        order.status === s && "text-bprimary bg-bprimary/5"
                                    )}
                                >
                                    {s}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Payment Update Toggle */}
                    <Button
                        onClick={() => handlePaymentUpdate(order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid')}
                        variant="outline"
                        className={cn(
                            "h-12 rounded-2xl px-6 font-bold shadow-lg transition-all",
                            order.paymentStatus === 'Paid'
                                ? "border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:text-white"
                                : "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:text-white"
                        )}
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {order.paymentStatus === 'Paid' ? "Mark as Unpaid" : "Mark as Paid"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Items Table */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-bprimary">
                                <ShoppingBag className="w-5 h-5" />
                                <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Ordered Items</h2>
                            </div>
                            <span className="text-xs text-gray-500">{order.items.length} unique fragrances</span>
                        </div>
                        <div className="p-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 text-left pb-4">
                                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">Product</th>
                                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 text-center">Qty</th>
                                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 text-right">Price</th>
                                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {order.items.map((item: any, i: number) => (
                                        <tr key={i} className="group">
                                            <td className="py-6">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 overflow-hidden relative shrink-0">
                                                        <Image src={item.featuredImage} alt={item.productName} fill className="object-cover p-1" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-white font-medium group-hover:text-bprimary transition-colors">{item.productName}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono mt-1">
                                                            {item.sku} • {item.volume} {item.variantType ? `(${item.variantType})` : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center text-gray-400">× {item.quantity}</td>
                                            <td className="py-6 text-right text-gray-400 font-mono text-sm">৳{item.price.toLocaleString()}</td>
                                            <td className="py-6 text-right text-bprimary font-medium">৳{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white/5 rounded-[2rem] border border-white/5 p-8 flex flex-col md:flex-row gap-8 justify-between items-center text-center md:text-left">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Internal Note</span>
                            <p className="text-sm text-gray-400 italic">Customer has placed {order.items.length} items. Verify inventory before processing.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="border-white/10 text-gray-400 hover:text-black/80 rounded-full">Print Invoice</Button>
                            <Button className="bg-bprimary text-black font-bold h-12 px-8 rounded-full shadow-lg shadow-bprimary/10">Ship Order</Button>
                        </div>
                    </div>
                </div>

                {/* Right: Customer Info & Summary */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Profile */}
                    <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-bprimary">
                                <User className="w-5 h-5" />
                                <h2 className="uppercase tracking-[0.2em] text-xs font-bold">Customer Info</h2>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-bprimary/10 border border-bprimary/20 flex items-center justify-center text-bprimary font-black uppercase shadow-inner">
                                    {user?.name?.[0] || "?"}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{user?.name || "Deleted Profile"}</h3>
                                    <span className="text-xs text-gray-500">ID: {user?._id?.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Email</span>
                                        <span className="text-sm text-gray-300">{user?.email || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Phone</span>
                                        <span className="text-sm text-gray-300">{order?.phoneNumber || user?.phoneNumber || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Shipping Address</span>
                                        <span className="text-sm text-gray-300 leading-relaxed">
                                            {order?.shippingAddress ? (
                                                `${order.shippingAddress.streetAddress}, ${order.shippingAddress.upazila}, ${order.shippingAddress.district}, ${order.shippingAddress.division} ${order.shippingAddress.postCode}`
                                            ) : (
                                                user?.address ?
                                                    `${user.address.streetAddress}, ${user.address.upazila}, ${user.address.district}, ${user.address.division} ${user.address.postCode}` :
                                                    "N/A"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Settlement Breakdown */}
            <div className="space-y-12 pt-12 border-t border-white/5">

                {/* Invoice Details */}
                <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-white/1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-bprimary/10 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-bprimary" />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold text-white uppercase tracking-widest leading-none">Financial Summary</h2>
                                <p className="text-[9px] text-gray-600 font-medium whitespace-nowrap">Charges breakdown</p>
                            </div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-bprimary/50 shadow-[0_0_10px_rgba(var(--bprimary),0.5)] animate-pulse" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-widest text-gray-700">Description</th>
                                    <th className="p-5 text-[9px] font-bold uppercase tracking-widest text-gray-700 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/2">
                                <tr className="group hover:bg-white/1 transition-colors">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white group-hover:text-bprimary transition-colors uppercase tracking-tight italic">Subtotal</span>
                                            <span className="text-[8px] text-gray-600 uppercase font-black tracking-tighter">Sum of all items</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right font-mono text-sm text-gray-300">৳{order.subtotal.toLocaleString()}</td>
                                </tr>
                                <tr className="group hover:bg-white/1 transition-colors">
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white group-hover:text-bprimary transition-colors uppercase tracking-tight italic">Shipping Fee</span>
                                            <span className="text-[8px] text-gray-600 uppercase font-black tracking-tighter">Delivery charge</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right font-mono text-sm text-gray-300">৳{order.shippingFee.toLocaleString()}</td>
                                </tr>
                                {order.couponCode && (
                                    <tr className="group hover:bg-white/1 transition-colors">
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-emerald-500 group-hover:text-emerald-400 transition-colors uppercase tracking-tight italic">Discount ({order.couponCode})</span>
                                                <span className="text-[8px] text-gray-600 uppercase font-black tracking-tighter">Coupon reduction</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-mono text-sm text-emerald-500">- ৳{order.discountAmount.toLocaleString()}</td>
                                    </tr>
                                )}
                                <tr className="bg-white/1">
                                    <td className="p-5">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Grand Total</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="inline-flex items-center gap-3">
                                            <span className="text-2xl font-black text-white">৳{order.totalAmount.toLocaleString()}</span>
                                            <div className="w-0.5 h-10 bg-bprimary/50" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-white/1 border-t border-white/5 flex items-center justify-center gap-4">
                        <p className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] opacity-30 text-center">Salaf Logistics System</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
