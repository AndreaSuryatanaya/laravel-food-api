export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string | null;
}

export interface Product {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    image_url?: string | null;
    category?: Category | null;
    created_at?: string;
}

export interface ProductFilters {
    search?: string;
    categoryId?: number;
    page?: number;
    perPage?: number;
}

export interface PaginatedProducts {
    data: Product[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface CartItem {
    id: number;
    quantity: number;
    product: Product;
}

export interface ProductInput {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
}

interface ApiEnvelope<T> {
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

const apiUrl = import.meta.env.VITE_API_URL || "/api";

class ApiClient {
    private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem("rasa-token");
        const headers = new Headers(init.headers);
        headers.set("Accept", "application/json");
        if (init.body) headers.set("Content-Type", "application/json");
        if (token) headers.set("Authorization", `Bearer ${token}`);

        const response = await fetch(`${apiUrl}${path}`, { ...init, headers });
        const body = (await response
            .json()
            .catch(() => ({}))) as ApiEnvelope<T> & {
            token?: string;
            user?: User;
        };
        if (!response.ok) {
            const validation = body.errors
                ? Object.values(body.errors).flat().join(" ")
                : "";
            throw new Error(
                validation ||
                    body.message ||
                    "Permintaan gagal. Silakan coba lagi.",
            );
        }
        return body as T;
    }

    async login(input: { email: string; password: string }) {
        return this.request<{ token: string; user: User }>("/login", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    async register(input: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) {
        return this.request<{ token: string; user: User }>("/register", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    async logout() {
        return this.request<{ message: string }>("/logout", { method: "POST" });
    }

    async getProducts(filters: ProductFilters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.categoryId)
            params.set("category_id", String(filters.categoryId));
        if (filters.page) params.set("page", String(filters.page));
        if (filters.perPage) params.set("per_page", String(filters.perPage));
        const suffix = params.size ? `?${params.toString()}` : "";
        return this.request<PaginatedProducts>(`/products${suffix}`);
    }

    async getProduct(id: number) {
        const result = await this.request<{ data: Product }>(`/products/${id}`);
        return result.data;
    }

    async getCategories() {
        const result = await this.request<{ data: Category[] }>("/categories");
        return result.data;
    }

    async getCart() {
        const result = await this.request<{ data: CartItem[] }>("/cart/items");
        return result.data;
    }

    async addToCart(product_id: number, quantity = 1) {
        return this.request<{ data: CartItem }>("/cart/items", {
            method: "POST",
            body: JSON.stringify({ product_id, quantity }),
        });
    }

    async removeCartItem(id: number) {
        return this.request<{ message: string }>(`/cart/items/${id}`, {
            method: "DELETE",
        });
    }

    async createProduct(input: ProductInput) {
        return this.request<{ data: Product }>("/products", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    async updateProduct(id: number, input: ProductInput) {
        return this.request<{ data: Product }>(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    }

    async deleteProduct(id: number) {
        return this.request<{ message: string }>(`/products/${id}`, {
            method: "DELETE",
        });
    }
}

export const api = new ApiClient();
