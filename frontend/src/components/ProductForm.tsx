import { useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Category, Product, ProductInput } from "../lib/api";

interface ProductFormProps {
    product?: Product;
    categories: Category[];
    isPending: boolean;
    onClose: () => void;
    onSave: (input: ProductInput) => void;
}

export default function ProductForm({
    product,
    categories,
    isPending,
    onClose,
    onSave,
}: ProductFormProps) {
    useEffect(() => {
        function handleKeydown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [onClose]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        onSave({
            category_id: Number(values.get("category_id")),
            name: String(values.get("name")),
            price: Number(values.get("price")),
            stock: Number(values.get("stock")),
            description: String(values.get("description") || ""),
            image_url: String(values.get("image_url") || ""),
        });
    }

    return (
        <div
            className="dialog-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="dialog-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-form-title"
            >
                <div className="form-title">
                    <div>
                        <p className="eyebrow">KATALOG</p>
                        <h2 id="product-form-title">
                            {product ? "Ubah produk" : "Produk baru"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="icon-button"
                        aria-label="Tutup form"
                        onClick={onClose}
                    >
                        <X size={19} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="form-stack">
                    <label>
                        Nama produk
                        <input
                            name="name"
                            required
                            maxLength={255}
                            defaultValue={product?.name}
                            placeholder="Contoh: Nasi ayam"
                        />
                    </label>
                    <div className="form-grid">
                        <label>
                            Kategori
                            <select
                                name="category_id"
                                required
                                defaultValue={product?.category?.id ?? ""}
                            >
                                <option value="" disabled>
                                    Pilih kategori
                                </option>
                                {categories.map((category) => (
                                    <option
                                        value={category.id}
                                        key={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Harga (Rp)
                            <input
                                name="price"
                                type="number"
                                min={0}
                                step={100}
                                required
                                defaultValue={product?.price}
                                placeholder="25000"
                            />
                        </label>
                        <label>
                            Stok
                            <input
                                name="stock"
                                type="number"
                                min={0}
                                step={1}
                                required
                                defaultValue={product?.stock}
                                placeholder="20"
                            />
                        </label>
                        <label>
                            URL gambar
                            <input
                                name="image_url"
                                type="url"
                                defaultValue={product?.image_url ?? ""}
                                placeholder="https://…"
                            />
                        </label>
                    </div>
                    <label>
                        Deskripsi
                        <textarea
                            name="description"
                            rows={3}
                            defaultValue={product?.description ?? ""}
                            placeholder="Ceritakan menu ini"
                        />
                    </label>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="button button-quiet"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            className="button button-primary"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan…" : "Simpan produk"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
