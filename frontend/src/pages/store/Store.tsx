import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
    ArrowRight,
    Check,
    ChefHat,
    LoaderCircle,
    Plus,
    Search,
    Utensils,
    X,
} from "lucide-react";
import type { Product, User } from "../../lib/api";
import {
    useAddToCart,
    useCart,
    useCategories,
    useProduct,
    useProducts,
} from "../../lib/queries";
import AppNavbar from "../../components/AppNavbar";

interface StoreProps {
    user: User;
    onLogout: () => void;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price);
export default function Store({ user, onLogout }: StoreProps) {
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detailProductId, setDetailProductId] = useState<number | null>(null);
    const [notice, setNotice] = useState("");
    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setAppliedSearch(search.trim()),
            300,
        );
        return () => window.clearTimeout(timeoutId);
    }, [search]);

    const filters = {
        search: appliedSearch,
        categoryId: categoryId === "all" ? undefined : Number(categoryId),
        page,
        perPage: 9,
    };
    const {
        data: productPage,
        isLoading,
        isPlaceholderData,
        error: productError,
        refetch,
    } = useProducts(filters);
    const products = productPage?.data ?? [];
    const { data: categories = [] } = useCategories();
    const { data: cart = [] } = useCart();
    const { data: detailProduct, isLoading: isDetailLoading } = useProduct(
        detailProductId ?? 0,
    );
    const addToCart = useAddToCart();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    async function handleAdd(product: Product) {
        setNotice("");
        try {
            await addToCart.mutateAsync(product.id);
            setNotice(`${product.name} masuk ke keranjang.`);
        } catch (error) {
            setNotice(
                error instanceof Error
                    ? error.message
                    : "Gagal menambahkan produk.",
            );
        }
    }

    return (
        <div className="store-shell">
            <AppNavbar
                user={user}
                cartCount={cartCount}
                activePage="menu"
                onLogout={onLogout}
            />

            <main className="store-content">
                <section className="hero">
                    <div className="hero-copy-block">
                        <p className="eyebrow">
                            <span className="eyebrow-line" /> DARI DAPUR, DENGAN
                            HATI
                        </p>
                        <h1>
                            Yang enak selalu
                            <br />
                            dekat <span>denganmu.</span>
                        </h1>
                        <p className="muted hero-description">
                            Hidangan pilihan, dibuat segar dan siap menemani
                            harimu.
                        </p>
                        <a href="#menu" className="button button-primary">
                            Temukan favoritmu <ArrowRight size={16} />
                        </a>
                        <div className="hero-note">
                            <span className="hero-note-icon">
                                <Check size={14} />
                            </span>{" "}
                            Bahan segar, rasa istimewa
                        </div>
                    </div>
                    <div className="hero-visual" aria-hidden="true">
                        <div className="hero-orbit orbit-one" />
                        <div className="hero-orbit orbit-two" />
                        <div className="hero-dish">
                            <span>🍜</span>
                        </div>
                        <div className="floating-card floating-top">
                            <span className="floating-icon">✦</span>
                            <span>
                                Baru dimasak
                                <br />
                                <strong>setiap hari</strong>
                            </span>
                        </div>
                        <div className="floating-card floating-bottom">
                            <span className="floating-emoji">🥑</span>
                            <span>
                                Fresh
                                <br />
                                <strong>& delicious</strong>
                            </span>
                        </div>
                        <div className="hero-spark spark-one">✳</div>
                        <div className="hero-spark spark-two">✦</div>
                    </div>
                    <div className="hero-footer">
                        <span>01 / MENU HARI INI</span>
                        <span className="hero-footer-line" />
                        <span>ENAKNYA SEDERHANA</span>
                    </div>
                </section>

                <section id="menu" className="section-block menu-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">PILIHAN UNTUKMU</p>
                            <h2>Menu favorit</h2>
                            <p className="muted section-description">
                                Temukan yang cocok untuk selera hari ini.
                            </p>
                        </div>
                        <div className="menu-tools">
                            <label className="search-box">
                                <Search size={17} />
                                <input
                                    type="search"
                                    placeholder="Cari makanan…"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    aria-label="Cari menu"
                                />
                            </label>
                            <select
                                aria-label="Filter kategori"
                                value={categoryId}
                                onChange={(event) => {
                                    setCategoryId(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">Semua kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {notice && (
                        <div className="notice" role="status">
                            <span>{notice}</span>
                            <button
                                aria-label="Tutup pemberitahuan"
                                onClick={() => setNotice("")}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}
                    {productError && (
                        <div className="alert alert-error">
                            {productError.message}{" "}
                            <button
                                className="text-button"
                                onClick={() => void refetch()}
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="loading-state">
                            <LoaderCircle className="spin" /> Memuat menu…
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">
                                <Utensils />
                            </span>
                            <h3>Menu belum ditemukan</h3>
                            <p>Coba kata kunci atau kategori yang berbeda.</p>
                        </div>
                    ) : (
                        <div
                            className={`products-grid${isPlaceholderData ? " products-grid-loading" : ""}`}
                        >
                            {products.map((product, index) => (
                                <article
                                    className="product-card"
                                    key={product.id}
                                >
                                    <button
                                        className={`product-image image-tone-${index % 4}`}
                                        type="button"
                                        onClick={() =>
                                            setDetailProductId(product.id)
                                        }
                                        aria-label={`Lihat ${product.name}`}
                                    >
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span
                                                className="food-placeholder"
                                                aria-hidden="true"
                                            >
                                                {
                                                    ["🥘", "🍲", "🥗", "🍛"][
                                                        index % 4
                                                    ]
                                                }
                                            </span>
                                        )}
                                        <span className="product-category">
                                            {product.category?.name ?? "Menu"}
                                        </span>
                                        {product.stock <= 0 && (
                                            <span className="sold-out">
                                                Habis
                                            </span>
                                        )}
                                    </button>
                                    <div className="product-info">
                                        <div className="product-title-row">
                                            <h3>{product.name}</h3>
                                            <span className="stock-note">
                                                {product.stock > 0
                                                    ? `Stok ${product.stock}`
                                                    : "Stok habis"}
                                            </span>
                                        </div>
                                        <p className="product-description">
                                            {product.description ||
                                                "Disiapkan segar dengan bahan pilihan."}
                                        </p>
                                        <div className="product-card-bottom">
                                            <strong>
                                                {formatPrice(product.price)}
                                            </strong>
                                            <button
                                                className="add-button"
                                                type="button"
                                                onClick={() =>
                                                    void handleAdd(product)
                                                }
                                                disabled={
                                                    product.stock <= 0 ||
                                                    addToCart.isPending
                                                }
                                                aria-label={`Tambah ${product.name} ke keranjang`}
                                            >
                                                <Plus size={17} />{" "}
                                                <span>Tambah</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    {productPage && (
                        <nav
                            className="pagination"
                            aria-label="Pagination menu"
                        >
                            <span className="pagination-summary">
                                Menampilkan {productPage.meta.from ?? 0}–
                                {productPage.meta.to ?? 0} dari{" "}
                                {productPage.meta.total} menu
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
                <Link className="brand" to="/">
                    <span className="brand-mark">R</span>
                    <span>
                        rasa<span className="brand-dot">.</span>
                    </span>
                </Link>
                <span>Menu enak, hari lebih baik.</span>
                <span className="footer-credit">
                    <ChefHat size={15} /> Dibuat dengan sepenuh rasa
                </span>
            </footer>

            {detailProductId !== null && (
                <div
                    className="dialog-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget)
                            setDetailProductId(null);
                    }}
                >
                    <section
                        className="dialog-card detail-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="detail-title"
                    >
                        <button
                            type="button"
                            className="icon-button detail-close"
                            aria-label="Tutup detail"
                            onClick={() => setDetailProductId(null)}
                        >
                            <X size={19} />
                        </button>
                        {isDetailLoading || !detailProduct ? (
                            <div className="loading-state">
                                <LoaderCircle className="spin" /> Memuat detail…
                            </div>
                        ) : (
                            <>
                                <div className="detail-image">
                                    {detailProduct.image_url ? (
                                        <img
                                            src={detailProduct.image_url}
                                            alt={detailProduct.name}
                                        />
                                    ) : (
                                        "🍲"
                                    )}
                                </div>
                                <p className="eyebrow">
                                    {detailProduct.category?.name ??
                                        "MENU PILIHAN"}
                                </p>
                                <h2 id="detail-title">{detailProduct.name}</h2>
                                <p className="muted">
                                    {detailProduct.description ||
                                        "Disiapkan segar dengan bahan pilihan."}
                                </p>
                                <div className="detail-footer">
                                    <strong>
                                        {formatPrice(detailProduct.price)}
                                    </strong>
                                    <button
                                        className="button button-primary"
                                        onClick={() => {
                                            void handleAdd(detailProduct);
                                            setDetailProductId(null);
                                        }}
                                        disabled={detailProduct.stock <= 0}
                                    >
                                        <Plus size={16} /> Tambah ke keranjang
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
