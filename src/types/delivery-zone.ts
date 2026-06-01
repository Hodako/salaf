export interface IDeliveryZone {
    _id: string;
    name: string;
    division?: string;
    district?: string;
    upazila?: string;
    deliveryFee: number;
    freeDeliveryThreshold?: number;
    priority: number;
    isActive: boolean;
}
