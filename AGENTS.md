<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Panduan & Aturan Koding Modular: SLIKU (Sistem Informasi Kesehatan Usaha Mikro)

Dokumen ini adalah pedoman standar untuk seluruh AI Agent dan pengembang dalam merancang, menulis kode, serta memelihara arsitektur modular proyek **SLIKU**.

## Aturan Utama
1. Wajib membaca `product/_general/tech-stack.md` dan `product/_general/prd.md` sebelum membuat atau merombak kode.
2. Setiap membuat fitur baru, wajib membaca spesifikasi di `product/<nama-fitur>/` terlebih dahulu.
3. Satu fitur = satu nama folder berpasangan di `modules/` dan `product/`.
4. Folder `app/` hanya rute tipis, seluruh logika utama disimpan di `modules/`.

## 1. Ringkasan Proyek

- **Nama Proyek**: SLIKU (Sistem Informasi Kesehatan Usaha Mikro)
- **Tujuan**: Aplikasi web berbasis *mobile-first* (PWA-ready) yang membantu pelaku usaha mikro, kecil, dan menengah (UMKM) mengelola pencatatan usaha, memonitor kesehatan finansial, serta mempersiapkan kelayakan profil usaha secara terstruktur, transparan, dan aman.
- **Target Pengguna**: Pemilik usaha mikro (misal: pedagang kelontong, kuliner mikro). Literasi digital beragam; antarmuka harus *clean*, intuitif, cepat dimuat, ramah navigasi satu tangan pada smartphone, dan tidak membingungkan.
- **Bahasa & Format**: Seluruh teks antarmuka menggunakan **Bahasa Indonesia**, format mata uang Rupiah (`id-ID`, contoh: `Rp15.000.000`), dan format penanggalan lokal.

---

## 2. Struktur Direktori Proyek

Proyek mengadopsi arsitektur modular berbasis fitur (*feature-driven modular structure*):

```text
sliku/
├── AGENTS.md               # Pedoman koding dan aturan modular untuk agent/developer
├── app/                    # Next.js App Router (hanya sebagai routing & komposisi halaman)
│   ├── globals.css         # Styling global Tailwind CSS
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Halaman utama / landing page
├── modules/                # Kode implementasi per fitur/domain bisnis
│   ├── <fitur-name>/       # Contoh: auth, daily-closing, health-score, profile
│   │   ├── components/     # Komponen UI spesifik untuk fitur ini
│   │   ├── hooks/          # Custom hooks spesifik fitur
│   │   ├── services/       # Komunikasi API, logic data, dan server actions
│   │   ├── types/          # Definisi TypeScript spesifik fitur
│   │   └── utils/          # Fungsi pembantu internal fitur
│   └── .gitkeep
├── product/                # Dokumen spesifikasi per fitur (berpasangan 1-ke-1 dengan modules/)
│   ├── _general/           # prd.md, personas.md, brand-guideline.md, tech-stack.md, glossary.md
│   ├── <fitur-name>/       # Subfolder fitur (contoh: auth, landing-page, assessment)
│   │   ├── prd.md
│   │   └── user-story.md
│   └── .gitkeep
├── shared/                 # Komponen dan modul yang digunakan bersama antar-fitur
│   ├── components/         # Komponen UI atomik/molekul reusable (Button, Modal, Input, Badge, dll.)
│   ├── hooks/              # Reusable hooks (useMediaQuery, useLocalStorage, dll.)
│   ├── lib/                # Konfigurasi library pihak ketiga, client helper
│   ├── types/              # Tipe data global (User, Response, Pagination, dll.)
│   ├── utils/              # Helper umum (formatRupiah, formatDate, validators)
│   └── .gitkeep
├── db/                     # Manajemen basis data
│   ├── schema/             # Definisi skema database / ORM (misal: Prisma / Drizzle / Supabase)
│   ├── migrations/         # Berkas migrasi database
│   ├── seeds/              # Data benih (dummy data untuk testing & demo UMKM)
│   └── .gitkeep
├── project/                # Catatan proses dan tata kelola pengembangan
│   ├── decisions/          # Architecture Decision Records (ADR)
│   ├── sprint/             # Catatan progres sprint, backlog, dan changelog
│   └── .gitkeep
├── public/                 # Aset statis (ikon, gambar, manifest PWA)
└── package.json            # Dependensi proyek
```

---

## 3. Aturan Koding Modular (Modular Coding Rules)

### A. Isolasi dan Batas Modul (Module Boundaries)
1. **Self-Contained**: Semua komponen, logika bisnis, dan tipe yang hanya dipakai oleh satu fitur harus berada di dalam `modules/<fitur-name>/`.
2. **Dilarang Circular Dependency**: Modul A **tidak boleh** mengimpor langsung dari Modul B secara melingkar.
3. **Penyedia Komponen Bersama**: Jika sebuah komponen, fungsi, atau tipe dibutuhkan oleh lebih dari satu modul, pindahkan ke direktori `shared/`.
4. **Peran Folder `app/`**:
   - File di dalam `app/` (misalnya `app/dashboard/page.tsx`) hanya berfungsi sebagai **orchestrator** (penyusun halaman).
   - Logika bisnis yang kompleks **tidak boleh** ditulis langsung di dalam `app/`. Cukup panggil komponen utama dari `modules/<fitur-name>/`.

### B. Konvensi Penulisan Kode (Coding Conventions)
1. **TypeScript Strict**: Selalu gunakan tipe eksplisit. Dilarang menggunakan tipe `any`. Gunakan `interface` atau `type` yang divalidasi.
2. **Penamaan Berkas**:
   - Komponen React: `PascalCase.tsx` (contoh: `DailyClosingCard.tsx`).
   - Hooks: `camelCase.ts` dengan awalan `use` (contoh: `useFinancialSummary.ts`).
   - Utils/Services: `camelCase.ts` (contoh: `currencyFormatter.ts`, `authService.ts`).
3. **Server vs Client Components**:
   - Standar default di Next.js App Router adalah **Server Components**.
   - Tambahkan direktif `"use client"` hanya pada komponen paling ujung (*leaf components*) yang membutuhkan `useState`, `useEffect`, event listener interaktif, atau API browser.

### C. Desain & Antarmuka Pengguna (UI/UX)
1. **Mobile-First**: Rancang dan uji tata letak pada resolusi perangkat bergerak (lebar 360px - 430px) terlebih dahulu sebelum tampilan desktop.
2. **Area Sentuh (Tap Target)**: Semua tombol dan elemen interaktif minimal memiliki tinggi/lebar 44px agar nyaman disentuh satu tangan.
3. **Identitas Visual SLIKU**:
   - Palet warna: Nuansa gelap modern (*Black / Zinc-950*) dengan aksen *Yellow-400 / Amber-400* untuk CTA dan indikator penting.
   - Tipografi yang jelas dan mudah dibaca, hindari jargon keuangan yang rumit untuk pengguna UMKM.

---

## 4. Aturan Bisnis & Keamanan (Business Rules)

1. **BR-01 (Kunci Akses)**: Pengguna tidak boleh dapat mengakses form transaksi (Daily Closing), data profil usaha, maupun dashboard tanpa autentikasi yang valid.
2. **BR-02 (Isolasi Data UMKM)**: Data satu UMKM bersifat rahasia dan terisolasi penuh. Sistem wajib memastikan tidak ada kebocoran atau tumpang tindih data antar-pelaku usaha (*strict multi-tenant isolation*).
3. **Transparansi & Edukasi**: Pesan di antarmuka harus konsisten menegaskan bahwa aplikasi SLIKU bertujuan untuk evaluasi kesehatan usaha dan **bukan pinjaman online (pinjol)**, serta tidak mengenakan biaya tersembunyi.
4. **Integritas Dokumen**: Setiap penambahan atau perubahan fitur wajib memperbarui dokumen terkait di `product/<fitur-name>.md` dan catatan progres di `project/`.

