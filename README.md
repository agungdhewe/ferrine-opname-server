# Stock Opname Server

Sistem backend Enterprise Stock Opname berbasis web yang dirancang untuk skalabilitas, integritas data, dan kemudahan integrasi dengan perangkat mobile.

## 🚀 Fitur Utama
- **Manajemen User & Device**: Autentikasi berbasis JWT dengan kontrol akses (RBAC).
- **Manajemen Item & Barcode**: Mendukung upload massal via CSV dengan validasi integritas.
- **Manajemen Proyek**: Pengaturan jadwal opname, penugasan user/device, dan monitoring progres.
- **Ringkasan Real-time**: Perhitungan stok sistem vs hasil scan dengan fitur filter pencarian dan download CSV.
- **Project Completion**: Mekanisme penyelesaian proyek yang aman dengan konfirmasi kode dan notifikasi Webhook.
- **Keamanan Data**: Menggunakan PostgreSQL untuk integritas relasional dan Redis untuk session/token blacklisting.

---

## 🛠️ Prasyarat (Requirements)
Sebelum memulai, pastikan Anda telah menginstal:
- **Node.js**: Versi 18 atau lebih baru.
- **PostgreSQL**: Versi 16 atau lebih baru.
- **Redis**: Server Redis aktif untuk caching dan blacklisting token.

---

## ⚙️ Panduan Setup

### 1. Kloning Repositori
```bash
git clone <repository-url>
cd opname-server
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` (jika ada) atau buat file `.env` baru di direktori akar. Berikut adalah contoh konfigurasi lengkap:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=db_opname

# Cache & Session (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=gunakan_string_acak_panjang_dan_aman
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# Webhook (Opsional)
ENABLE_PROJECT_COMPLETED_WEBHOOK=true
PROJECT_COMPLETED_WEBHOOK_URL=https://target-api.com/callback
PROJECT_COMPLETED_WEBHOOK_SECRET=secret_key_untuk_signature
```

### 4. Setup Database
Pastikan database PostgreSQL sudah dibuat. Jalankan file migrasi secara berurutan untuk membentuk skema:
1. `database/migration-1.sql` (Skema awal)
2. `database/migration-2.sql` (Pembaruan kolom proyek)

### 5. Menjalankan Server
**Mode Pengembangan (Auto-reload):**
```bash
npm run dev
```
**Mode Produksi:**
```bash
npm start
```

---

## 🔗 Integrasi Webhook (Project Completion)

Saat proyek ditandai sebagai selesai (*Mark as Completed*), sistem akan mengirimkan notifikasi POST ke `PROJECT_COMPLETED_WEBHOOK_URL`.

### Format Payload (JSON)
```json
{
  "projectId": 12,
  "projectCode": "OP-JKT-24",
  "timestamp": 1705750000
}
```

### Keamanan (Digital Signature)
Sistem menggunakan header `X-Webhook-Signature` yang dihasilkan melalui HMAC-SHA256 menggunakan `PROJECT_COMPLETED_WEBHOOK_SECRET`. 

**Rumus Signature:**
`HMAC-SHA256(secret, body_json + nonce + timestamp)`

---

## 🔐 Aturan Immutability
Proyek yang sudah berstatus **COMPLETED** akan terkunci secara permanen:
1. **Header Proyek**: Tidak dapat diedit.
2. **Item Proyek**: Tidak dapat ditambah/diupload ulang.
3. **User & Device**: Daftar akses dikunci (tidak bisa tambah/hapus).
4. **Status**: Tidak dapat diubah kembali menjadi ACTIVE.

---

## 📄 Lisensi
Hak Cipta © 2026 - Development Team.