# Product Requirement Document (PRD) - SLIKU
Target : UMKM Indonesia
## 1. Visi dan Tujuan Produk (Objective) 
SLIKU adalah aplikasi  berbasis *mobile-first* yang dirancang untuk membantu para pelaku usaha mikro, kecil, dan menengah (UMKM) dalam mengelola data usahanya secara terstruktur, transparan dan aman. Tujuan dari MVP (Minimum Viable Product) ini adalah menyediakan fondasi manajemen digital yang mudah diakses tanpa proses yang rumit, sesuai dengan kurikulum proyek tugas akhir.
## 2. Target Pengguna (User Persona)
**Nama Persona:** Pak Budi (42 Tahun)
**Profil:** Pemilik Usaha toko kelontong/kuliner skala mikro dengan literasi tingkat menengah.
**Kebutuhan:** Membutuhkan Sistem pencatatan yang cepat, tidak memakan waktu, antarmuka yang bersih(*Clean UI*), serta jaminan keamanan data privasi usahanya
## 3. Ruang lingkup Proyek (In-Scope)
Proyek MVP ini dikerjakan dalam waktu 5 minggu dengan total *825 User Story (US-00 s,d US-24)**, yang mencangkup 7 tahapan perjalanan UMKM (mulai dari Autentikasi/Landing Page, Manajemen Profil, hingga Pelaporan dan pencatatan transaksi)
## 4. Batasan Proyek (Out-of-Scope)
Untuk menjaga fokus penyelesaian MVP dalam waktu 5 minggu, hal-hal berikut **tidak termasuk** dalam ruang lingkup versi ini:
* Integrasi pembayaran pihak ketiga skala enterprice (kecuali simulasi dasar QRIS/pembayaran jika diminta pada sprint lanjutan)
* Fitur multi-bahasa (aplikasi hanya menggunakan bahasa Indonesia)
* Versi Desktop Native (Fokus penuh pada responsif *Mobile Web / PWA* )
## 5. Aturan Bisnis (Business Rules)
* BR-01 (Kunci Akses): Pengguna sama sekali tidak bisa masuk ke form Daily Closing atau Dashboard jika belum memiliki akun dan belum berhasil Login.
* BR-02 (Keamanan): Password harus dirahasiakan, dan data satu UMKM tidak boleh bocor atau tertukar dengan UMKM lainnya di dalam sistem.