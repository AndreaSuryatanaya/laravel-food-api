name: frontend-skills
description: Panduan struktur folder dan gaya penulisan kode untuk (React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui + TanStack Query). Gunakan setiap kali menambah/mengubah halaman, komponen, hook, query API, atau styling di project ini agar konsisten dengan kode yang sudah ada.

# Role

I am a Senior Frontend Engineer with strongly in React with clean architecture, reusable component , readable code, maintanable code and clearly folder structure

## Tech stack

```json
{
    "name": "client",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "tsc -b && vite build",
        "lint": "eslint .",
        "preview": "vite preview"
    },
    "dependencies": {
        "@radix-ui/react-checkbox": "^1.3.3",
        "@radix-ui/react-dialog": "^1.1.15",
        "@radix-ui/react-label": "^2.1.8",
        "@radix-ui/react-select": "^2.2.6",
        "@radix-ui/react-slot": "^1.2.4",
        "@tailwindcss/vite": "^4.1.18",
        "@tanstack/react-query": "^5.90.12",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "lucide-react": "^0.561.0",
        "react": "^19.2.0",
        "react-dom": "^19.2.0",
        "react-router": "^7.10.1",
        "tailwind-merge": "^3.4.0",
        "tailwindcss": "^4.1.18"
    },
    "devDependencies": {
        "@eslint/js": "^9.39.1",
        "@types/node": "^24.10.1",
        "@types/react": "^19.2.5",
        "@types/react-dom": "^19.2.3",
        "@vitejs/plugin-react": "^5.1.1",
        "eslint": "^9.39.1",
        "eslint-plugin-react-hooks": "^7.0.1",
        "eslint-plugin-react-refresh": "^0.4.24",
        "globals": "^16.5.0",
        "typescript": "~5.9.3",
        "typescript-eslint": "^8.46.4",
        "vite": "^7.2.4"
    }
}
```

---

## Tech stack

- React 19, TypeScript 5.9 (strict), Vite 7, pnpm
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` di `src/index.css`, tanpa `tailwind.config.js`)
- shadcn/ui (style `new-york`, base `neutral`) + Radix + `cva` + `lucide-react`
- TanStack Query v5 untuk semua data fetching
- react-router v7 (import dari `'react-router'`, bukan `react-router-dom`)
- Backend PayloadCMS (query `where[...]`), URL dari `VITE_API_URL`

Perintah: `pnpm dev`, `pnpm build` (`tsc -b && vite build`), `pnpm lint`.

## Struktur folder

```
src/
├── main.tsx                 # StrictMode > QueryProvider > BrowserRouter > App
├── App.tsx                  # Routes + ProtectedRoute
├── index.css                # Tailwind + design token (@theme)
├── providers/               # Context provider (QueryProvider)
├── lib/
│   ├── api.ts               # Tipe domain + class ApiClient + `export const api`
│   ├── queries.ts           # SEMUA hook TanStack Query + queryKeys
│   └── utils.ts             # cn()
├── components/
│   ├── ui/                  # Primitive shadcn (button, input, card, dialog, ...)
│   ├── <Feature>.tsx        # Komponen container fitur (OrdersList, OrderDetails, OrderReceipt)
│   └── <Feature>/           # Sub-komponen privat milik fitur tsb:
│       ├── constants.ts     #   label, variant, opsi, config
│       ├── utils.ts         #   helper murni (format, getter)
│       ├── use<Nama>.ts     #   hook khusus fitur
│       └── <Bagian>.tsx     #   potongan UI
└── pages/
    └── <route>/
        ├── <Page>.tsx       # Komponen halaman (default export)
        └── components/      # hooks.ts, utils.ts, bagian-bagian UI halaman
docs/                        # Dokumentasi aksesibilitas per halaman
```

Aturan penempatan:

- **Halaman** → `src/pages/<area>/`. Daftarkan route di `App.tsx`; halaman yang butuh login dibungkus `<ProtectedRoute>`.
- **Komponen besar** dipecah ke folder dengan nama sama dengan komponennya (`OrdersList.tsx` + `OrdersList/`). Container tetap di `components/`, bagian kecil di dalam foldernya.
- **Logika** dipisah dari tampilan: konstanta → `constants.ts`, fungsi murni → `utils.ts`, efek/state kompleks → `use*.ts` / `hooks.ts`.
- **Primitive UI** hanya di `components/ui/` (tambah lewat shadcn, jangan buat style tombol/input sendiri).
- **Akses API** hanya lewat `lib/api.ts` → dibungkus hook di `lib/queries.ts`. Komponen tidak boleh memanggil `fetch`/`api.*` langsung.

## Gaya penulisan kode

### Umum

- Komponen = **function declaration** dengan `export default function Nama(...)` (halaman & komponen fitur). Primitive `ui/` memakai `forwardRef` + named export (gaya shadcn).
- Props didefinisikan sebagai `interface NamaProps` tepat di atas komponen; props event diawali `on` (`onClick`, `onOrderSelect`), handler internal diawali `handle` (`handleSubmit`, `handleSearch`).
- Hook custom: `useXxx`; fungsi helper murni: arrow function `export const getXxx = ...` atau `calculateXxx`.
- `import type { ... }` untuk tipe (wajib: `verbatimModuleSyntax`). Hindari `enum` (`erasableSyntaxOnly`) — pakai union string literal (`'pending' | 'in-progress' | ...`) dan `Record<Union, ...>` untuk mapping.
- TypeScript strict, tanpa variabel/parameter tak terpakai. Hindari `any`.
- Komentar singkat berbahasa Inggris yang menjelaskan _kenapa/apa_ di blok state, effect, dan handler (`// Reset selection when filter changes`). Fungsi helper & hook diberi JSDoc satu baris (`/** Calculate total price ... */`).
- File yang berisi banyak seksi memakai pembatas:
    ```ts
    // ============================================================================
    // ORDER HOOKS
    // ============================================================================
    ```
- Indentasi & kutip: mayoritas 2 spasi + single quote + titik koma (`QueryProvider`, `OrdersList`, `utils`). Beberapa halaman (`Login`, `Orders`) memakai 4 spasi + double quote. **Ikuti gaya file yang sedang diedit**; file baru → 2 spasi, single quote, titik koma. `lib/queries.ts` tanpa titik koma.
- Alias `@/` dipakai untuk `components/ui/*` dan `lib/utils` (`@/components/ui/button`). Import relatif (`../../lib/api`, `../lib/queries`) masih dipakai untuk `lib/api` & `lib/queries` — boleh keduanya, jangan campur dalam satu blok yang sama tanpa alasan.
- Urutan import: React/library → `lib/*` & tipe → komponen `@/components/ui/*` → sub-komponen/helper lokal.

### State & data

- State lokal dengan `useState`; nilai turunan dengan `useMemo` (mis. `queryParams`, `filteredOrders`); referensi DOM dengan `useRef<HTMLInputElement>(null)`.
- Reset state terkait saat filter/sort/search berubah (`setSelectedIndex(-1)`).
- Hanya status data server yang lewat TanStack Query; jangan salin ke state kecuali perlu.
- Alias hasil query dengan destructuring: `const { data: ordersData, isLoading: loading, error, refetch } = useOrders(queryParams)`; fallback `ordersData?.docs || []`.
- Mutation: `const { mutate: loginWorker, isPending, error } = useLoginWorker({ onSuccess: ... })`; setelah sukses `navigate(...)` atau `queryClient.setQueryData(...)`.

### Menambah endpoint baru (pola wajib)

1. Tambah tipe di `lib/api.ts` (`interface`, `*Input`), lalu method di `ApiClient` yang me-return `Promise<ApiResponse<T>>` lewat `this.request<T>(...)`. `request` **tidak melempar error**; ia mengembalikan `{ data }` atau `{ error }`.
2. Tambah key di `queryKeys` (`lib/queries.ts`) — array `as const`; fungsi bila ada parameter.
3. Tambah hook di seksi yang sesuai. Pola:

    ```ts
    export function useThing(
        id: string,
        options?: Omit<UseQueryOptions<Thing>, "queryKey" | "queryFn">,
    ) {
        return useQuery({
            queryKey: queryKeys.thing(id),
            queryFn: async () => {
                const result = await api.getThing(id);
                if (result.error || !result.data) {
                    throw new Error(result.error || "Failed to fetch thing");
                }
                return result.data;
            },
            enabled: !!id,
            ...options,
        });
    }
    ```

    - Parameter terakhir selalu `options` yang di-spread di akhir agar bisa di-override.
    - Mutation: `onSuccess` meng-invalidate `['orders']` / `['customers']` dan/atau `setQueryData`; teruskan `options?.onSuccess`.
    - Beri `staleTime` yang masuk akal dengan komentar (`// 5 minutes - services don't change often`), dan `enabled` untuk query yang bergantung input (mis. panjang minimal telepon).

4. Default global di `providers/QueryProvider.tsx`: `staleTime 1m`, `gcTime 5m`, `refetchOnWindowFocus: false`, `retry: 1`.

### Styling (Tailwind v4 + shadcn)

- Pakai kelas utilitas langsung di JSX; gabungkan kondisional dengan `cn()` (`@/lib/utils`) atau template string untuk kasus sederhana.
- Warna lewat token semantik: `bg-primary`, `text-muted-foreground`, `border-input`, `text-destructive`, `ring-primary`. Token didefinisikan di `@theme` pada `index.css` (primary `#7c3fff`). Jangan hardcode hex di komponen.
- Pola layout umum: `space-y-4`, `flex items-center justify-between gap-3`, `grid grid-cols-2 md:grid-cols-4 gap-3`, teks sekunder `text-sm text-muted-foreground`, kartu `p-4 hover:shadow-md transition-all cursor-pointer`, seleksi `ring-2 ring-primary`.
- Varian komponen baru dibuat dengan `cva` + `VariantProps` seperti `button.tsx`.
- Ikon dari `lucide-react`; loading = `<Loader2 className="animate-spin" />`.
- Mapping status → tampilan disimpan di `constants.ts` (`statusVariants`, `statusLabels`), bukan di-inline.

### Pola UI umum

- Tiga keadaan list: loading (spinner + teks) → error (`<Alert variant="destructive">` + tombol `Try again` yang memanggil `refetch`) → empty (`EmptyState`) → data. Ditulis sebagai ternary berantai.
- Form: `<form onSubmit>` dengan `e.preventDefault()`, `Label htmlFor` + `Input id`, field `disabled={isPending}`, error mutation ditampilkan di `Alert` destructive.
- Format tanggal: `toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })`. Uang/berat dihitung di `utils.ts` (`calculateTotalPrice`, dst.).
- Relasi PayloadCMS bisa `string | Entity`; selalu lewat helper `getCustomerName`, `getServiceName` yang mengecek `typeof x === 'object'`.

### Aksesibilitas & keyboard (inti produk ini)

- Semua alur utama bisa dilakukan tanpa mouse. Shortcut didaftarkan di hook `useEffect` dengan `window.addEventListener('keydown', ...)` + cleanup `removeEventListener`, dan dependency lengkap (lint `react-hooks`).
- Selalu abaikan shortcut saat fokus di input:
    ```ts
    const target = e.target as HTMLElement;
    const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
    ```
    dan saat modal/dialog terbuka (`isModalOpen || target.closest('[role="dialog"]')`). Jangan pakai shortcut bila ada modifier (`ctrl/meta/alt/shift`) kecuali memang disengaja.
- Shortcut yang sudah ada: `N` (order baru), `/` (fokus cari), `Esc`/`Home` (batal/hapus pencarian), `1–9, 0` (pilih order / toggle layanan), `PageUp/PageDown` (pindah input), `Ctrl+P` (cetak), `Shift+Esc` (keluar fullscreen). Cek `docs/` sebelum menambah shortcut baru agar tidak bentrok.
- Auto-focus input utama saat mount (`useEffect(() => ref.current?.focus(), [])`).
- Gunakan atribut ARIA: `role="status"` + `aria-label` untuk loading, `Label htmlFor`, fokus ring terlihat (`focus-visible:ring-4`).
- Perubahan perilaku keyboard/aksesibilitas → perbarui file terkait di `docs/accessibility-*.md` (Overview, Implementation Location, Key Accessibility Features dengan contoh kode dan "Accessibility Benefits").
- `App.tsx` memaksa fullscreen dan mencegat `Esc`; jangan merusak mekanisme ini saat menyentuh handler global.

## Checklist sebelum selesai

1. File ditempatkan sesuai struktur di atas; logika dipisah ke `constants/utils/hooks`.
2. Tidak ada `fetch`/`api.*` langsung di komponen; hook baru ada di `lib/queries.ts` dengan `queryKeys`.
3. `import type` dipakai untuk tipe; tidak ada `enum`; tidak ada variabel tak terpakai.
4. Warna memakai token semantik; komponen dasar memakai `components/ui/*`.
5. Shortcut baru menghormati `isInputFocused` & modal, ada cleanup listener.
6. Jalankan `pnpm lint` dan `pnpm build` (type-check) — keduanya harus bersih.
