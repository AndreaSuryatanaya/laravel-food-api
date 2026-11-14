import { Link } from 'react-router';
import { ArrowLeft, ChefHat, LoaderCircle, ShoppingBag, Trash2 } from 'lucide-react';
import type { User } from '../../lib/api';
import { useCart, useRemoveCartItem } from '../../lib/queries';
import AppNavbar from '../../components/AppNavbar';

interface CartProps {
  user: User;
  onLogout: () => void;
}

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

export default function Cart({ user, onLogout }: CartProps) {
  const { data: cart = [], isLoading, error } = useCart();
  const removeCartItem = useRemoveCartItem();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  return (
    <div className="store-shell">
      <AppNavbar user={user} cartCount={cartCount} activePage="cart" onLogout={onLogout} />

      <main className="store-content cart-page">
        <Link className="back-link" to="/menu"><ArrowLeft size={15} /> Kembali ke menu</Link>
        <section className="cart-page-heading"><p className="eyebrow">PESANAN ANDA</p><h1>Keranjang</h1><p className="muted">Periksa pilihan menu sebelum melanjutkan.</p></section>
        {error && <div className="alert alert-error" role="alert">{error.message}</div>}
        {removeCartItem.error && <div className="alert alert-error" role="alert">{removeCartItem.error.message}</div>}
        {isLoading ? <div className="loading-state"><LoaderCircle className="spin" /> Memuat keranjang…</div> : cart.length === 0 ? <div className="empty-state cart-page-empty"><span className="empty-icon"><ShoppingBag /></span><h2>Keranjang masih kosong</h2><p>Temukan sesuatu yang enak dari menu pilihan kami.</p><Link className="button button-primary" to="/menu">Jelajahi menu <ArrowLeft className="arrow-forward" size={16} /></Link></div> : <div className="cart-layout cart-page-layout">
          <section className="cart-list" aria-label="Daftar item keranjang">{cart.map((item) => <article className="cart-item" key={item.id}>
            <div className="cart-thumb">{item.product.image_url ? <img src={item.product.image_url} alt="" /> : '🍽️'}</div>
            <div className="cart-item-detail"><h3>{item.product.name}</h3><p>{item.product.category?.name ?? 'Menu pilihan'} <span>· {formatPrice(item.product.price)} × {item.quantity}</span></p></div>
            <strong>{formatPrice(item.product.price * item.quantity)}</strong>
            <button className="icon-button danger-icon" aria-label={`Hapus ${item.product.name} dari keranjang`} disabled={removeCartItem.isPending} onClick={() => removeCartItem.mutate(item.id)}><Trash2 size={16} /></button>
          </article>)}</section>
          <aside className="cart-summary"><p>Ringkasan pesanan</p><div><span>Jumlah menu</span><span>{cartCount} item</span></div><div><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(cartTotal)}</strong></div><p className="summary-note">Checkout belum tersedia. Hubungi toko untuk menyelesaikan pesanan.</p><Link className="button button-quiet summary-back" to="/menu">Tambah menu lain</Link></aside>
        </div>}
      </main>
      <footer className="footer"><Link className="brand" to="/menu"><span className="brand-mark">R</span><span>rasa<span className="brand-dot">.</span></span></Link><span>Menu enak, hari lebih baik.</span><span className="footer-credit"><ChefHat size={15} /> Dibuat dengan sepenuh rasa</span></footer>
    </div>
  );
}
