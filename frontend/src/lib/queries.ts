import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ProductFilters, type ProductInput } from "./api";

export const queryKeys = {
    products: (filters?: ProductFilters) =>
        ["products", filters ?? {}] as const,
    product: (id: number) => ["products", id] as const,
    categories: ["categories"] as const,
    cart: ["cart"] as const,
};

export function useProducts(filters: ProductFilters) {
    return useQuery({
        queryKey: queryKeys.products(filters),
        queryFn: () => api.getProducts(filters),
        placeholderData: (previousData) => previousData,
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: queryKeys.product(id),
        queryFn: () => api.getProduct(id),
        enabled: id > 0,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: () => api.getCategories(),
        staleTime: 300_000,
    });
}

export function useCart() {
    return useQuery({ queryKey: queryKeys.cart, queryFn: () => api.getCart() });
}

export function useAddToCart() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (productId: number) => api.addToCart(productId),
        onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.cart }),
    });
}

export function useRemoveCartItem() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.removeCartItem(id),
        onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.cart }),
    });
}

export function useLogout() {
    return useMutation({ mutationFn: () => api.logout() });
}

export function useSaveProduct() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id?: number; input: ProductInput }) =>
            id ? api.updateProduct(id, input) : api.createProduct(input),
        onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }),
    });
}

export function useDeleteProduct() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.deleteProduct(id),
        onSuccess: () => client.invalidateQueries({ queryKey: ["products"] }),
    });
}
