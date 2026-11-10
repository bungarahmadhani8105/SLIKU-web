# Tech Stack & Konvensi Teknis - SLIKU

Dokumen ini mendefinisikan standar teknologi, arsitektur modular, dan konvensi pengembangan aplikasi SLIKU.

---

## 1. Core Stack
- **Runtime:** Node.js
- **Framework:** Next.js (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS

---

## 2. Database & Data Layer
- **Database:** SQLite
- **ORM:** Prisma
- **Skema Database:** Terpusat di `prisma/schema.prisma` dengan pemodelan entitas per fitur.

---

## 3. Autentikasi & Keamanan
- **Mekanisme Autentikasi:** JWT (JSON Web Token) untuk manajemen sesi dan verifikasi akses.
- **Konfigurasi & Rahasia:** Disimpan di file `.env` (tidak di-commit ke repositori).

---

## 4. Validasi & Pengujian
- **Validasi Skema & Input:** Zod (validasi payload API dan form input).
- **Testing Framework:** Vitest.
- **Standar Kode:** ESLint + Prettier untuk konsistensi dan pemformatan kode.

---

## 5. Arsitektur Proyek Modular
Proyek mengadopsi struktur berbasis fitur (*feature-based structure*):
- Setiap modul dokumen pada `product/<fitur>/` memiliki pasangan implementasi kode yang ekuivalen pada `modules/<fitur>/`.
- Pemisahan tanggung jawab (*Separation of Concerns*):
  - `product/<fitur>/` : Dokumen spesifikasi (PRD, flow, wireframe, user story).
  - `modules/<fitur>/` : Kode implementasi (komponen UI, hooks, logika bisnis, dan API handler fitur terkait).
  - `prisma/` : Skema data per fitur yang terdefinisi rapi.

