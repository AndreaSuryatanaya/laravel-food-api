# Rasa frontend

Frontend mandiri dengan React 19, TypeScript, Vite, Tailwind CSS v4, React Router, dan TanStack Query. Frontend ini menggunakan Laravel API yang dijalankan terpisah.

## Menjalankan aplikasi

1. Jalankan backend dari root Laravel: `php artisan serve` (default `http://127.0.0.1:8000`).
2. Di folder `frontend/`, salin `.env.example` menjadi `.env` bila API berjalan di host lain. Nilai default `/api` menggunakan proxy Vite menuju backend di port 8000.
3. Jalankan `npm install`, lalu `npm run dev` di folder `frontend/`.

Frontend tersedia di URL Vite yang ditampilkan terminal. Untuk production, atur `VITE_API_URL` ke URL API Laravel yang dapat dijangkau browser.

## Cakupan fitur

- Register, login, dan logout memakai token Sanctum bearer.
- Jelajah, pencarian, filter kategori, dan detail produk.
- Tambah item dari katalog dan kelola item pada halaman keranjang `/cart`.
- CRUD produk pada halaman admin `/admin/products`; pemeriksaan hak akses tetap dilakukan backend.

Backend belum menyediakan checkout atau perubahan jumlah item keranjang. Akun register baru memperoleh role pelanggan; role admin perlu diberikan di backend.

## Filter katalog

`GET /api/products` menerima `search` (mencocokkan nama atau deskripsi), `category_id`, `page`, dan `per_page`. Default `per_page` adalah 9 dan maksimum 100. Respons menggunakan format resource pagination Laravel (`data`, `links`, dan `meta`).
