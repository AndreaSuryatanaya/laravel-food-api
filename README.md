<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Laravel Food API

REST API untuk katalog makanan (kategori, produk, keranjang) dengan autentikasi Laravel Sanctum, beserta frontend React di folder `frontend/`.

## Kebutuhan

- PHP 8.3 atau lebih baru dan Composer
- Node.js 20 atau lebih baru dan npm
- SQLite (default; ekstensi `pdo_sqlite` aktif)

## Setup backend

```bash
# 1. Pasang dependensi PHP
composer install

# 2. Siapkan environment
cp .env.example .env
php artisan key:generate

# 3. Buat database SQLite, lalu migrasi dan isi data awal
touch database/database.sqlite
php artisan migrate --seed

# 4. Jalankan server (http://localhost:8000)
php artisan serve
```

Cara singkat: `composer run setup` menjalankan langkah install, `.env`, key, migrasi, dan build aset sekaligus.

Cek API berjalan dengan membuka `http://localhost:8000/api/health`, atau coba lewat Postman/Thunder Client.

### Menjadikan user sebagai admin

Operasi tambah, ubah, dan hapus produk hanya untuk admin. Akun baru memiliki role `user`. Ubah role lewat tinker:

```bash
php artisan tinker
>>> App\Models\User::where('email', 'budi@example.com')->update(['role' => 'admin']);
```

## Setup frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Backend harus berjalan di port 8000. CORS hanya mengizinkan `http://localhost:5173` (lihat `config/cors.php`). Detail lain ada di `frontend/README.md`.

## Mencoba API

Import `docs/api.json` ke Postman atau Thunder Client. Jalankan **Login** atau **Register** lebih dulu. Semua request memakai `http://localhost:8000`; ubah di file jika port berbeda.

## Menjalankan test

```bash
php artisan test
```

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Product API

Semua endpoint produk memerlukan autentikasi Sanctum. Pengguna yang sudah login dapat membaca daftar dan detail produk. Operasi tambah, ubah, dan hapus produk hanya tersedia untuk admin.

### Daftar, cari, filter, dan pagination produk

`GET /api/products` menerima parameter query berikut:

| Parameter     | Tipe              | Default | Keterangan                                                           |
| ------------- | ----------------- | ------- | -------------------------------------------------------------------- |
| `search`      | string, opsional  | —       | Mencari teks pada nama atau deskripsi produk. Maksimum 255 karakter. |
| `category_id` | integer, opsional | —       | Membatasi hasil ke kategori yang ID-nya valid.                       |
| `page`        | integer, opsional | `1`     | Nomor halaman, minimal `1`.                                          |
| `per_page`    | integer, opsional | `9`     | Jumlah produk per halaman, antara `1` dan `100`.                     |

Parameter dapat digabung. Contoh, mencari “ayam” dalam kategori `2`, halaman kedua:

```http
GET /api/products?search=ayam&category_id=2&page=2&per_page=9
Authorization: Bearer <sanctum-token>
Accept: application/json
```

Respons menggunakan resource pagination Laravel. `data` berisi produk pada halaman aktif, `links` berisi URL navigasi, dan `meta` berisi jumlah halaman serta informasi rentang hasil.

```json
{
    "data": [
        {
            "id": 12,
            "name": "Ayam Bakar",
            "description": "Ayam bakar bumbu pilihan",
            "price": 28000,
            "stock": 8,
            "image_url": null,
            "category": {
                "id": 2,
                "name": "Makanan",
                "description": null
            },
            "created_at": "2026-11-13T10:00:00.000000Z"
        }
    ],
    "links": {
        "first": "http://localhost/api/products?search=ayam&category_id=2&per_page=9&page=1",
        "last": "http://localhost/api/products?search=ayam&category_id=2&per_page=9&page=4",
        "prev": "http://localhost/api/products?search=ayam&category_id=2&per_page=9&page=1",
        "next": "http://localhost/api/products?search=ayam&category_id=2&per_page=9&page=3"
    },
    "meta": {
        "current_page": 2,
        "from": 10,
        "last_page": 4,
        "per_page": 9,
        "to": 18,
        "total": 32
    }
}
```

Nilai `search`, `category_id`, `page`, dan `per_page` divalidasi oleh `IndexProductRequest`. Parameter yang tidak valid akan menghasilkan respons validasi `422`. Hasil selalu diurutkan dari produk terbaru, dan parameter query dipertahankan pada URL pagination.

### Tutorial: perubahan pada `ProductController`

Sebelumnya, method `index()` mengambil semua produk dengan `get()`. Agar daftar dapat dicari dan dibagi ke beberapa halaman, perubahan dilakukan di tiga bagian berikut.

#### 1. Validasi parameter request

Buat `app/Http/Requests/IndexProductRequest.php`. Form Request ini memastikan filter sesuai format sebelum query dijalankan:

```php
public function rules(): array
{
    return [
        'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
        'page' => ['sometimes', 'integer', 'min:1'],
        'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
    ];
}
```

`exists:categories,id` menolak ID kategori yang tidak ada. Batas `per_page` mencegah client meminta terlalu banyak data dalam satu respons.

#### 2. Terima Form Request dan ambil filter tervalidasi

Di bagian import `ProductController`, tambahkan:

```php
use App\Http\Requests\IndexProductRequest;
use Illuminate\Database\Eloquent\Builder;
```

Lalu ubah signature method:

```php
public function index(IndexProductRequest $request)
{
    $filters = $request->validated();
    $search = trim($filters['search'] ?? '');
```

Laravel menjalankan validasi sebelum method controller dipanggil. Karena itu query memakai `$request->validated()`, bukan seluruh input mentah.

#### 3. Susun query secara kondisional

Ganti `get()` dengan query yang menerapkan filter hanya saat parameternya dikirim:

```php
    $products = Product::query()
        ->with('category')
        ->when($search !== '', function (Builder $query) use ($search): void {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        })
        ->when(isset($filters['category_id']), fn (Builder $query) =>
            $query->where('category_id', $filters['category_id'])
        )
        ->latest()
        ->paginate($filters['per_page'] ?? 9)
        ->withQueryString();
```

Kondisi pencarian dikelompokkan dalam satu `where` agar artinya tetap `(nama cocok OR deskripsi cocok)`, lalu filter kategori diterapkan sebagai kondisi tambahan. `with('category')` tetap memuat relasi kategori untuk resource produk.

`paginate()` menggantikan `get()`: jumlah per halaman memakai `per_page` atau default `9`; parameter `page` dibaca otomatis oleh paginator Laravel. `withQueryString()` mempertahankan filter saat pengguna pindah halaman.

#### 4. Kembalikan collection paginator

Gunakan resource collection secara langsung:

```php
    return ProductResource::collection($products);
}
```

Karena `$products` adalah paginator, Laravel menyertakan `data`, `links`, dan `meta` pada respons. Jangan membungkus collection ini lagi dalam `response()->json(['data' => ...])`, supaya metadata pagination ikut diserialisasi.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
