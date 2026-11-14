import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LoaderCircle, Plus, Search, Trash2, Utensils } from "lucide-react";
import AppNavbar from "../../components/AppNavbar";
import ProductForm from "../../components/ProductForm";
import type { Product, ProductInput, User } from "../../lib/api";
import {
    useCart,
    useCategories,
    useDeleteProduct,
    useProducts,
    useSaveProduct,
} from "../../lib/queries";

interface AdminProductsProps {
    user: User;
    onLogout: () => void;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price);

export default function AdminProducts({ user, onLogout }: AdminProductsProps) {
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [page, setPage] = useState(1);
    const [editingProduct, setEditingProduct] = useState<
        Product | null | undefined
    >(undefined);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setAppliedSearch(search.trim()),
            300,
        );
        return () => window.clearTimeout(timeoutId);
    }, [search]);

    const { data: cart = [] } = useCart();
    const { data: categories = [] } = useCategories();
    const filters = {
        search: appliedSearch,
        categoryId: categoryId === "all" ? undefined : Number(categoryId),
        page,
        perPage: 10,
    };
    const {
        data: productPage,
        isLoading,
        isPlaceholderData,
        error,
        refetch,
    } = useProducts(filters);
    const products = productPage?.data ?? [];
    const saveProduct = useSaveProduct();
    const deleteProduct = useDeleteProduct();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    async function handleSave(input: ProductInput) {
        try {
            await saveProduct.mutateAsync({ id: editingProduct?.id, input });
            setEditingProduct(undefined);
            setNotice(
                editingProduct
                    ? "Produk berhasil diperbarui."
                    : "Produk berhasil ditambahkan.",
            );
        } catch (saveError) {
            setNotice(
                saveError instanceof Error
                    ? saveError.message
                    : "Produk gagal disimpan.",
            );
        }
    }

    async function handleDelete(product: Product) {
        if (!window.confirm(`Hapus ${product.name} dari katalog?`)) return;
        try {
            await deleteProduct.mutateAsync(product.id);
            setNotice("Produk berhasil dihapus.");
        } catch (deleteError) {
            setNotice(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Produk gagal dihapus.",
            );
        }
    }

    return (
        <div className="store-shell">
            <AppNavbar
                user={user}
                cartCount={cartCount}
                activePage="products"
                onLogout={onLogout}
            />
            <main className="store-content admin-product-page">
                <Link className="back-link" to="/menu">
                    ← Kembali ke katalog
                </Link>
                <section className="admin-page-heading">
                    <div>
                        <p className="eyebrow">AREA ADMIN</p>
                        <h1>Kelola produk</h1>
                        <p className="muted">
                            Tambah, ubah, dan atur ketersediaan produk di
                            katalog.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setEditingProduct(null)}
                    >
                        <Plus size={17} /> Produk baru
                    </button>
                </section>

                <section
                    className="admin-products-card"
                    aria-label="Daftar produk"
                >
                    <div className="admin-products-toolbar">
                        <label className="search-box">
                            <Search size={17} />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Cari produk…"
                                aria-label="Cari produk"
                            />
                        </label>
                        <select
                            value={categoryId}
                            onChange={(event) => {
                                setCategoryId(event.target.value);
                                setPage(1);
                            }}
                            aria-label="Filter kategori"
                        >
                            <option value="all">Semua kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {notice && (
                        <div className="notice" role="status">
                            <span>{notice}</span>
                            <button
                                type="button"
                                aria-label="Tutup pemberitahuan"
                                onClick={() => setNotice("")}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error.message}{" "}
                            <button
                                type="button"
                                className="text-button"
                                onClick={() => void refetch()}
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="loading-state">
                            <LoaderCircle className="spin" /> Memuat produk…
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">
                                <Utensils />
                            </span>
                            <h3>Produk belum ditemukan</h3>
                            <p>Coba kata kunci atau kategori lain.</p>
                        </div>
                    ) : (
                        <div
                            className={`table-wrap${isPlaceholderData ? " products-grid-loading" : ""}`}
                        >
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Kategori</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="table-product">
                                                    <span>
                                                        {product.image_url ? (
                                                            <img
                                                                src={
                                                                    product.image_url
                                                                }
                                                                alt=""
                                                            />
                                                        ) : (
                                                            "🍽️"
                                                        )}
                                                    </span>
                                                    <strong>
                                                        {product.name}
                                                    </strong>
                                                </div>
                                            </td>
                                            <td>
                                                {product.category?.name ?? "—"}
                                            </td>
                                            <td>
                                                {formatPrice(product.price)}
                                            </td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="text-button"
                                                        onClick={() =>
                                                            setEditingProduct(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        Ubah
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-button danger-icon"
                                                        aria-label={`Hapus ${product.name}`}
                                                        disabled={
                                                            deleteProduct.isPending
                                                        }
                                                        onClick={() =>
                                                            void handleDelete(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {productPage && (
                        <nav
                            className="pagination"
                            aria-label="Pagination produk"
                        >
                            <span className="pagination-summary">
                                Menampilkan {productPage.meta.from ?? 0}–
                                {productPage.meta.to ?? 0} dari{" "}
                                {productPage.meta.total} produk
                            </span>
                            {productPage.meta.last_page > 1 && (
                                <div className="pagination-actions">
                                    <button
                                        type="button"
                                        className="page-button"
                                        disabled={
                                            page <= 1 || isPlaceholderData
                                        }
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(1, current - 1),
                                            )
                                        }
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className="page-current">
                                        {productPage.meta.current_page} /{" "}
                                        {productPage.meta.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        className="page-button"
                                        disabled={
                                            page >=
                                                productPage.meta.last_page ||
                                            isPlaceholderData
                                        }
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(
                                                    productPage.meta.last_page,
                                                    current + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            )}
                        </nav>
                    )}
                </section>
            </main>
            <footer className="footer">
                <Link className="brand" to="/menu">
                    <span className="brand-mark">R</span>
                    <span>
                        rasa<span className="brand-dot">.</span>
                    </span>
                </Link>
                <span>Menu enak, hari lebih baik.</span>
                <span className="footer-credit">
                    <Utensils size={15} /> Pengelolaan katalog
                </span>
            </footer>
            {editingProduct !== undefined && (
                <ProductForm
                    product={editingProduct ?? undefined}
                    categories={categories}
                    isPending={saveProduct.isPending}
                    onClose={() => setEditingProduct(undefined)}
                    onSave={(input) => void handleSave(input)}
                />
            )}
        </div>
    );
}
