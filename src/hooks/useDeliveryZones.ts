"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { IDeliveryZone } from "@/types/delivery-zone";

/**
 * Custom hook for managing delivery zones and calculating shipping fees.
 * 
 * Fetches the list of active delivery zones and provides functions to 
 * find matching zones and calculate delivery fees.
 * 
 * @returns An object containing delivery zones and loading state.
 */
export function useDeliveryZones() {
    return useQuery<IDeliveryZone[]>({
        queryKey: ["delivery-zones"],
        queryFn: async () => {
            const { data } = await api.get("/admin/delivery-zones");
            return data;
        },
    });
}

/**
 * Hook for creating a new delivery zone.
 * 
 * @returns Mutation state for delivery zone creation.
 */
export function useCreateDeliveryZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: response } = await api.post("/admin/delivery-zones", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
        },
    });
}

/**
 * Hook for updating an existing delivery zone's details.
 * 
 * @returns Mutation state for delivery zone updates.
 */
export function useUpdateDeliveryZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: response } = await api.put(`/admin/delivery-zones/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
        },
    });
}

/**
 * Hook for deleting a delivery zone.
 * 
 * @returns Mutation state for delivery zone deletion.
 */
export function useDeleteDeliveryZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/delivery-zones/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
        },
    });
}

