"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useAdminCoupons";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CouponFormValues {
    code: string;
    description?: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
    maxDiscountAmount?: number;
    minimumPurchaseAmount?: number;
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
    maxUsesPerUser?: number;
    isActive: boolean;
}

export const CouponForm = ({ initialData, onSuccess }: { initialData?: any; onSuccess: () => void }) => {
    const createCoupon = useCreateCoupon();
    const updateCoupon = useUpdateCoupon();

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(z.object({
            code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
            description: z.string().optional(),
            discountType: z.enum(["percentage", "fixed_amount"]),
            discountValue: z.coerce.number().min(0),
            maxDiscountAmount: z.coerce.number().min(0).optional(),
            minimumPurchaseAmount: z.coerce.number().min(0).optional(),
            validFrom: z.string().min(1, "Start date is required"),
            validUntil: z.string().min(1, "End date is required"),
            usageLimit: z.coerce.number().min(1).optional(),
            maxUsesPerUser: z.coerce.number().min(1).optional(),
            isActive: z.boolean().default(true),
        }) as any),
        defaultValues: initialData ? {
            ...initialData,
            validFrom: new Date(initialData.validFrom).toISOString().split('T')[0],
            validUntil: new Date(initialData.validUntil).toISOString().split('T')[0],
        } : {
            isActive: true,
            discountType: "fixed_amount",
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            maxUsesPerUser: 1,
        },
    });

    const onSubmit = async (values: CouponFormValues) => {
        try {
            if (initialData) {
                await updateCoupon.mutateAsync({ id: initialData._id, ...values });
                toast.success("Coupon updated successfully");
            } else {
                await createCoupon.mutateAsync(values);
                toast.success("Coupon created successfully");
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    const isSubmitting = createCoupon.isPending || updateCoupon.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
                <FormField
                    control={form.control as any}
                    name="code"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Coupon Code</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="WELCOME10" className="bg-white/5 border-white/10 uppercase" />
                            </FormControl>
                            <FormDescription>Unique code customers will enter at checkout.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Getting started discount for new users" className="bg-white/5 border-white/10 min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control as any}
                        name="discountType"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="discountValue"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch("discountType") === "percentage" && (
                    <FormField
                        control={form.control as any}
                        name="maxDiscountAmount"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Max Discount Amount (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" placeholder="Cap the maximum discount" className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormDescription>Maximum ৳ amount that can be deducted.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control as any}
                    name="minimumPurchaseAmount"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Minimum Purchase Amount (Optional)</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" placeholder="0" className="bg-white/5 border-white/10" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control as any}
                        name="validFrom"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Valid From</FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" className="bg-white/5 border-white/10 text-white scheme-dark" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="validUntil"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Valid Until</FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" className="bg-white/5 border-white/10 text-white scheme-dark" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control as any}
                        name="usageLimit"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Usage Limit (Total)</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" placeholder="Optional" className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="maxUsesPerUser"
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Uses Per User</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control as any}
                    name="isActive"
                    render={({ field }: { field: any }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-4 bg-white/5">
                            <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <FormDescription>Uncheck to disable the coupon instantly.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button 
                    type="submit" 
                    className="w-full bg-white text-black hover:bg-gray-200"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {initialData ? "Update Coupon" : "Create Coupon"}
                </Button>
            </form>
        </Form>
    );
};
