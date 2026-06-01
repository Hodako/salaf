"use client";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    Truck,
    Loader2,
    AlertCircle,
    ArrowRight,
    MapPin
} from "lucide-react";
import { 
    useDeliveryZones, 
    useCreateDeliveryZone, 
    useUpdateDeliveryZone, 
    useDeleteDeliveryZone 
} from "@/hooks";
import { IDeliveryZone } from "@/types/delivery-zone";
import { FormFieldLabel } from "@/components/admin/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    allDivision,
    districtsOf,
    upazilaNamesOf,
} from "@bangladeshi/bangladesh-address/build/src/index";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function DeliveryZonesPage() {
    const { data: zones = [], isLoading } = useDeliveryZones();
    const { mutateAsync: createZone, isPending: isCreating } = useCreateDeliveryZone();
    const { mutateAsync: updateZone, isPending: isUpdating } = useUpdateDeliveryZone();
    const { mutateAsync: deleteZone, isPending: isDeleting } = useDeleteDeliveryZone();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [formData, setFormData] = useState({ 
        name: "", 
        division: "", 
        district: "", 
        upazila: "", 
        deliveryFee: 0, 
        freeDeliveryThreshold: 0, 
        priority: 0,
        isActive: true 
    });

    // Address selection states
    const divisions = allDivision();
    const districts = formData.division ? districtsOf(formData.division) : [];
    const upazilas = formData.district ? upazilaNamesOf(formData.district) : [];

    const filteredZones = zones.filter((z: any) => 
        z.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setSelectedZone(null);
        setFormData({ 
            name: "", 
            division: "", 
            district: "", 
            upazila: "", 
            deliveryFee: 0, 
            freeDeliveryThreshold: 0, 
            priority: 0,
            isActive: true 
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (zone: any) => {
        setSelectedZone(zone);
        setFormData({ 
            name: zone.name, 
            division: zone.division || "", 
            district: zone.district || "", 
            upazila: zone.upazila || "", 
            deliveryFee: zone.deliveryFee, 
            freeDeliveryThreshold: zone.freeDeliveryThreshold || 0,
            priority: zone.priority || 0,
            isActive: zone.isActive
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedZone) {
                await updateZone({ id: selectedZone._id, data: formData });
                toast.success("Delivery zone updated successfully");
            } else {
                await createZone(formData);
                toast.success("Delivery zone created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
    };

    const handleDelete = async () => {
        if (!selectedZone) return;
        try {
            await deleteZone(selectedZone._id);
            toast.success("Delivery zone deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete zone");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-[#c06b40]" /> Delivery Zones
                    </h1>
                    <p className="text-gray-500 mt-1">Manage geographic shipping rates and free delivery rules.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#c06b40] hover:bg-[#a85d35] text-white px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Zone
                </Button>
            </div>

            {/* Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#c06b40] transition-colors" />
                <Input 
                    placeholder="Search zones..." 
                    className="pl-10 bg-[#111] border-white/5 focus:border-[#c06b40]/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Zone Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Region</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rates</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredZones.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No delivery zones defined.
                                    </td>
                                </tr>
                            ) : (
                                filteredZones.map((zone: any) => (
                                    <tr key={zone._id} className="hover:bg-white/1 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">{zone.name}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-[#c06b40]" />
                                                {zone.upazila || zone.district || zone.division || (
                                                    <span className="text-bprimary font-black uppercase text-[10px] tracking-widest">All Bangladesh</span>
                                                )}
                                                {(zone.upazila || zone.district) && (
                                                    <span className="text-[10px] text-gray-600">
                                                        ({zone.division})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-white font-mono text-sm">৳ {zone.deliveryFee}</div>
                                                {zone.freeDeliveryThreshold > 0 && (
                                                    <div className="text-[10px] text-green-500 uppercase font-black tracking-tighter">
                                                        Free above ৳ {zone.freeDeliveryThreshold}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="border-white/10 text-gray-500">
                                                {zone.priority}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                                                    onClick={() => handleOpenEdit(zone)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => {
                                                        setSelectedZone(zone);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedZone ? "Edit Delivery Zone" : "Add Delivery Zone"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Configure geographic rules and shipping rates for this zone.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4 max-h-[75vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormFieldLabel label="Zone Name" tooltip="A descriptive name (e.g., 'Dhaka Core')." required />
                                <Input 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                    placeholder="Dhaka Division"
                                />
                            </div>
                            <div className="space-y-2">
                                <FormFieldLabel label="Priority" tooltip="Higher priority zones take precedence over broader ones." />
                                <Input 
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-6">
                            <div className="flex items-center gap-2 text-[#c06b40] mb-2">
                                <MapPin className="w-4 h-4" />
                                <h3 className="text-xs uppercase font-bold tracking-widest">Geographic Boundaries</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 px-1">Division</label>
                                    <select 
                                        value={formData.division}
                                        onChange={(e) => setFormData({ ...formData, division: e.target.value, district: "", upazila: "" })}
                                        className="w-full bg-black border border-white/5 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#c06b40]/50"
                                    >
                                        <option value="">All Divisions</option>
                                        {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 px-1">District</label>
                                    <select 
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value, upazila: "" })}
                                        disabled={!formData.division}
                                        className="w-full bg-black border border-white/5 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#c06b40]/50 disabled:opacity-30"
                                    >
                                        <option value="">All Districts</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 px-1">Upazila</label>
                                    <select 
                                        value={formData.upazila}
                                        onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                                        disabled={!formData.district}
                                        className="w-full bg-black border border-white/5 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#c06b40]/50 disabled:opacity-30"
                                    >
                                        <option value="">All Upazilas</option>
                                        {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 italic">Leave fields blank to match the entire parent region (e.g., leave Upazila blank to match whole District).</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormFieldLabel label="Delivery Fee (৳)" required />
                                <Input 
                                    type="number"
                                    required
                                    value={formData.deliveryFee}
                                    onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
                                    className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <FormFieldLabel label="Free Above (৳)" tooltip="Set to 0 to disable free delivery threshold." />
                                <Input 
                                    type="number"
                                    value={formData.freeDeliveryThreshold}
                                    onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) })}
                                    className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="bg-[#c06b40] hover:bg-[#a85d35] text-white min-w-[100px]">
                                {isCreating || isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedZone ? "Save Changes" : "Create Zone")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                        <AlertDialogTitle>Delete Delivery Zone?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedZone?.name}"</span>? 
                            Shipping calculations for this region will revert to default rules.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white border-none h-10 min-w-[80px]"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
