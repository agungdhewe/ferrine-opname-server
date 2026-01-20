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
## Global Data Rules
- Semua data harus dapat diaudit siapa creator dan yang terakhir update
- semua perubahan data harus di log
- tidak ada hard delete untuk:
  - ProjectHeader
  - ProjectResult
  - ProjectDetail


---
## Data Model

Dokumen ini mendefinisikan **logical data model** dan **aturan (rules)**  
sebagai kontrak antara **Android App**, **Backend API**, dan **Database**.

### Device

- deviceId : INT        [PK]
- name     : TEXT
- disabled : BOOL
```text
Rules:
- Device dapat dinonaktifkan tanpa dihapus
```


---
### User
- username (TEXT) [PK]
- fullname (TEXT)
- password (TEXT) [HASHED]
- isAdmin (BOOL)
- allowOpname (BOOL)
- allowReceiving (BOOL)
- allowTransfer (BOOL)
- allowPrintLabel (BOOL)
- disabled (BOOL)

```text
Rules:
- password harus hashed
```
---
### UserDevice
- username (TEXT) [FK -> User.username]
- deviceId (INT) [FK -> Device.deviceId]
``` text
Rules:
- satu user bisa mengakses banyak device
- kombinasi (username, deviceId) unik
```

---
### Item
- itemId (TEXT) [PK]
- article (TEXT)
- material (TEXT)
- color (TEXT)
- size (TEXT)
- name (TEXT)
- description (TEXT)
- category (TEXT)

```text
Rules:
- itemId immutable
```
---
### Barcode
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT)
```text
Rules:
- barcode unik
- barcode tidak boleh diubah
- satu item bisa punya banyak barcode
```
---
### ProjectHeader
- projectId (TEXT) [PK]
- dateStart (DATE)
- dateEnd (DATE)
- description (TEXT)
- workingType (TEXT)
- disabled (BOOL)
- siteCode (TEXT)
- brandCode (TEXT)
```text
Rules:
- satu project aktif per site + brand
- project disabled = true → semua transaksi ditolak
- projectId immutable
```
---
### ProjectDetail
- projectId (TEXT) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- price (DECIMAL)
- sellPrice (DECIMAL)
- discount (DECIMAL)
- isSpecialPrice (BOOL)
- stockQty (INT)
- printQty (INT)
- pricingId (TEXT)
```text
- kombinasi (projectId, itemId) unik
- printQty hanya untuk label
- stockQty digunakan untuk opname, receiving, transfer
pricingId referensi pricing aktif
```

---
### ProjectResult
- projectId (TEXT) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- deviceId (INT) [FK -> Device.deviceId]
- timestamp (TIMESTAMP)
- barcode (TEXT)
- scannedQty (INT)
```text
Rules:
- kombinasi (projectId, itemId, deviceId, barcode) unik
- scannedQty tidak boleh diubah
- barcode tidak boleh diubah
- deviceId tidak boleh diubah
- projectId tidak boleh diubah
- itemId tidak boleh diubah
```
---
## Relasi Data
- User 1---N UserDevice N---1 Device
- Item 1---N Barcode
- ProjectHeader 1---N ProjectDetail
- ProjectHeader 1---N ProjectResult
---
## Data Contract Rules

### DbContract
`DbContract` adalah satu-satunya sumber kebenaran (Single Source of Truth)
untuk:
- Nama tabel database
- Nama kolom database
- Alias resmi yang digunakan di query

### Mandatory Rules
- DR1: Semua query database MUST menggunakan nama tabel dan kolom dari `DbContract`
- DR2: Hardcoded string untuk nama tabel atau kolom MUST NOT digunakan
- DR3: Query yang tidak menggunakan `DbContract` dianggap invalid
- DR4: Perubahan nama tabel atau kolom hanya boleh dilakukan di `DbContract`
- DR5: Review code MUST menolak query yang melanggar aturan ini
### DbContract Structure (Conceptual)

DbContract:
- Device.TABLE
- Device.Columns.deviceId
- Device.Columns.name
- Device.Columns.disabled

- User.TABLE
- User.Columns.username
- User.Columns.fullname
- User.Columns.password

### Forbidden Patterns
- Menuliskan nama tabel sebagai string literal di query
- Menuliskan nama kolom langsung di SQL string
- Menyusun SQL dengan nama field manual

### Enforcement
- Semua query harus melalui layer repository / DAO
- Code review wajib memverifikasi penggunaan DbContract
- Static analysis / lint rule direkomendasikan

---
## Instruksi Khusus untuk AI
1. Jika saya meminta fitur baru, selalu prioritaskan aspek **keamanan** dan **integritas data**.
2. Berikan contoh kode yang sudah menyertakan **logging** dan **error handling**.
3. Jika ada perubahan skema database, ingatkan saya untuk melakukan migrasi pada PostgreSQL 16.
4. Gunakan gaya bahasa yang profesional dan teknis dalam Bahasa Indonesia.
