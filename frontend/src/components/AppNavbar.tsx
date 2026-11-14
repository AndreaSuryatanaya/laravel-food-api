import { CircleUserRound, LogOut } from "lucide-react";
import { Link } from "react-router";
import type { User } from "../lib/api";
import { useLogout } from "../lib/queries";

interface AppNavbarProps {
    user: User;
    cartCount: number;
    activePage: "menu" | "cart" | "products";
    onLogout: () => void;
}

export default function AppNavbar({
    user,
    cartCount,
    activePage,
    onLogout,
}: AppNavbarProps) {
    const logout = useLogout();
    const isAdmin = user.role === "admin";

    function handleLogout() {
        logout.mutate(undefined, { onSettled: onLogout });
    }

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <Link className="brand" to="/menu" aria-label="Rasa beranda">
                    <span className="brand-mark">R</span>
                    <span>
                        rasa<span className="brand-dot">.</span>
                    </span>
                </Link>
                <nav className="nav-links" aria-label="Navigasi utama">
                    <Link
                        className={
                            activePage === "menu" ? "nav-active" : undefined
                        }
                        aria-current={
                            activePage === "menu" ? "page" : undefined
                        }
                        to="/menu#menu"
                    >
                        Menu
                    </Link>
                    <Link
                        className={
                            activePage === "cart" ? "nav-active" : undefined
                        }
                        aria-current={
                            activePage === "cart" ? "page" : undefined
                        }
                        to="/cart"
                    >
                        Keranjang{" "}
                        <span className="cart-count">{cartCount}</span>
                    </Link>
                    {isAdmin && (
                        <Link
                            className={
                                activePage === "products"
                                    ? "nav-active"
                                    : undefined
                            }
                            aria-current={
                                activePage === "products" ? "page" : undefined
                            }
                            to="/admin/products"
                        >
                            Kelola produk
                        </Link>
                    )}
                </nav>
                <div className="account">
                    <span className="account-avatar">
                        <CircleUserRound size={17} />
                    </span>
                    <span className="account-name">{user.name}</span>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className="button button-quiet logout-button"
                    >
                        <LogOut size={16} />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
