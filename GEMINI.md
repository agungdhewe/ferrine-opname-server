# 🤖 GEMINI Context Guide: StockOpname Server
Dokumen ini adalah panduan konteks bagi asisten AI (Gemini) untuk memahami aturan, standar, dan arsitektur proyek Backend Stock Opname ini. Semua saran kode dan pengembangan fitur wajib mematuhi ketentuan di bawah ini.
---

---
## Project Overview
- Web based Application
- Backend: Node.js (Express)
- Use case: Stock Opname multi-device multi-store
- Support horizontal scaling


---
## Tech Stack Utama
- **Runtime:** Node.js (Full ES6 Modules - `import/export`)
- **Framework:** Express.js
- **Template Engine:** EJS
- **Client Framework:** Bootstrap 5
- **Database:** PostgreSQL 16
- **Cache & Session:** Redis
- **Auth:** JSON Web Token (JWT) & bcrypt untuk hashing password



---
## Standar Penulisan Kode
- **JavaScript:** Gunakan `ES6` baik di server maupun client.
- **Variabel & Fungsi:** Gunakan `camelCase`.
- **Asynchronous:** Wajib menggunakan `async/await`.
- **Error Handling:** Wajib menggunakan blok `try { ... } catch (error) { ... }` pada setiap fungsi.
- **Data Credentials:** Untuk server side, dilarang keras menulis data sensitif di dalam kode. Gunakan `process.env` (file `.env`).
- **Dokumentasi:** Gunakan komentar JSDoc dalam **Bahasa Indonesia**.



---
## Struktur Kerja & Flow
- **Business Logic:** Pisahkan antara `Controllers` (handler request) dan `Services` (logika bisnis & integrasi DB/Redis).
- **Testing:** Gunakan framework testing (seperti Jest/Mocha) untuk memastikan setiap endpoint berjalan sesuai ekspektasi.
- **Readme:** Gunakan `README.md` untuk dokumentasi instalasi bagi manusia.
- **Gemini Context:** Gunakan file `GEMINI.md` ini sebagai acuan utama instruksi AI.


---
## UI Component
- **Layout UI:** Bootstrap 5
- **Tabel data:** DataTables
- **Dropdown search:** Select2
- **Input harga:** Inputmask
- **Notifikasi:** SweetAlert2
- **Interaksi tanpa reload:** HTMX (opsional)
---
## Instruksi Khusus untuk AI
1. Jika saya meminta fitur baru, selalu prioritaskan aspek **keamanan** dan **integritas data**.
2. Berikan contoh kode yang sudah menyertakan **logging** dan **error handling**.
3. Jika ada perubahan skema database, ingatkan saya untuk melakukan migrasi pada PostgreSQL 16.
4. Gunakan gaya bahasa yang profesional dan teknis dalam Bahasa Indonesia.
