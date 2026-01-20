# 🤖 GEMINI Context Guide: StockOpname Server
Dokumen ini adalah panduan konteks bagi asisten AI (Gemini) untuk memahami aturan, standar, dan arsitektur proyek Backend Stock Opname ini. Semua saran kode dan pengembangan fitur wajib mematuhi ketentuan di bawah ini.
---

---
## 🏗️ Project Overview & Architecture
- **Type:** Web-based Enterprise Stock Opname
- **Backend:** Node.js (Express.js) - Full ES6 Modules (`import/export`)
- **Database:** PostgreSQL 16 (Relational Integrity)
- **Cache/Session:** Redis (Speed & Token Blacklisting)
- **Scale:** Dirancang untuk horizontal scaling
---
## 🛠️ Tech Stack & UI Standards
- **Template Engine:** EJS (Server Side Rendering)
- **Client Framework:** Bootstrap 5, HTMX (untuk interaksi parsial tanpa reload)
- **Components:** DataTables (Grid), Select2 (Searchable Dropdown), SweetAlert2 (Notif), Inputmask (Currency/Qty)
- **Auth:** JWT (Stateless) + bcrypt (Hashing)
---
## Standar Penulisan Kode
- **Variabel & Fungsi:** Gunakan `camelCase`.
- **Error Handling:** Wajib menggunakan blok `try { ... } catch (error) { ... }` pada setiap fungsi.
- **Data Credentials:** Untuk server side, dilarang keras menulis data sensitif di dalam kode. Gunakan `process.env` (file `.env`).
- **Dokumentasi:** Gunakan komentar JSDoc dalam **Bahasa Indonesia**.
- **Variabel:** Gunakan const untuk variabel yang tidak berubah dan let untuk variabel yang nilainya berubah; hindari penggunaan var.



---
## Struktur Kerja & Flow
- **Business Logic:** Pisahkan antara `Controllers` (handler request) dan `Services` (logika bisnis & integrasi DB/Redis).
- **Testing:** Gunakan framework testing (seperti Jest/Mocha) untuk memastikan setiap endpoint berjalan sesuai ekspektasi.
- **Readme:** Gunakan `README.md` untuk dokumentasi instalasi bagi manusia.
- **Gemini Context:** Gunakan file `GEMINI.md` ini sebagai acuan utama instruksi AI.


---
## 🔐 Security & Auth Rules (Strict)
1. **No Anonymous Access:** Semua endpoint (kecuali `/login`) wajib melewati Middleware Autentikasi.
2. **RBAC (Role-Based Access Control):** Pengecekan flag user (`isAdmin`, `allowOpname`, dll) dilakukan di level middleware sebelum masuk ke controller.
3. **Token Revocation:** Gunakan Redis untuk menyimpan 'Blacklisted Tokens' saat user logout atau akun di-disable.
4. **Credential Safety:** Dilarang hardcode kredensial. Gunakan `.env`.
---
## Logical Data Model

Dokumen ini mendefinisikan **logical data model** dan **aturan (rules)**  
sebagai kontrak antara **Opname Web App**, **Backend Service**, dan **Database**.

*(Setiap tabel menyertakan audit fields: createdBy, createdAt, updatedBy, updatedAt, isDeleted)*

*jika ada field disabled, berarti digunakan untuk menonaktifkan data, tanpa dihapus (tetap tampil di list)*

*jika ada field isDeleted, berarti digunakan untuk menghapus data secara logis, tanpa dihapus fisik (tidak tampil di list)*

format:
EntityName (`table_name`)
- fieldName : DataType [PK/FK] [Description]


### Device (`device`)
- deviceId : INT [PK] AUTO_INCREMENT
- name : TEXT [UNIQUE]
- secret : TEXT
- disabled : BOOL

### User (`user`)
- username (TEXT) [PK]
- fullname (TEXT)
- password (TEXT) [HASHED]
- isAdmin (BOOL)
- allowOpname (BOOL)
- allowReceiving (BOOL)
- allowTransfer (BOOL)
- allowPrintLabel (BOOL)
- disabled (BOOL)


### Item (`item`)
- itemId (TEXT) [PK]
- brandCode (TEXT)
- article (TEXT)
- material (TEXT)
- color (TEXT)
- size (TEXT)
- name (TEXT)
- disabled (BOOL)
- description (TEXT)
- category (TEXT)
- price (DECIMAL)
- sellPrice (DECIMAL)
- discount (DECIMAL)
- isSpecialPrice (BOOL)
- stockQty (INT)
- printQty (INT)
- pricingId (TEXT)


### Barcode (`barcode`)
- barcodeId (SERIAL) [PK]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT) 
- brandCode (TEXT)
- [Constraint]: Unique(barcode, brandCode)


### ProjectHeader (`project`)
- projectId (SERIAL) [PK]
- projectCode (TEXT) [UNIQUE]
- projectName (TEXT)
- dateStart (DATE)
- dateEnd (DATE)
- description (TEXT)
- workingType (TEXT)
- disabled (BOOL)
- siteCode (TEXT)
- brandCode (TEXT)
- isCompleted (BOOL)
- projectStatus (TEXT)

### ProjectUser (`project_user`)
- projectId (SERIAL) [FK -> ProjectHeader.projectId]
- username (TEXT) [FK -> User.username]
- deviceId (INT) [FK -> Device.deviceId]
- lastSync (TIMESTAMP)

### ProjectDetail (`project_detil`)
- projectId (SERIAL) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT)
- price (DECIMAL)
- sellPrice (DECIMAL)
- discount (DECIMAL)
- isSpecialPrice (BOOL)
- stockQty (INT)
- printQty (INT)
- pricingId (TEXT)



### ProjectResult (`project_result`)
- projectId (SERIAL) [FK -> ProjectHeader.projectId]
- itemId (TEXT) [FK -> Item.itemId]
- barcode (TEXT)
- deviceId (INT) [FK -> Device.deviceId]
- username (TEXT) [FK -> User.username]
- timestamp (TIMESTAMP)
- scannedQty (INT)
- [Constraint]: Unique(projectId, deviceId, timestamp) -> Untuk keperluan UPSERT

---
## Relasi Data
- User 1---N UserDevice N---1 Device
- Item 1---N Barcode
- ProjectHeader 1---N ProjectUser
- ProjectHeader 1---N ProjectDetail
- ProjectHeader 1---N ProjectResult
---
## 📊 Business Rules

### Core Tables & Integrity
- **Device:** 
  - device tidak boleh dihapus, hanya bisa dinonaktifkan.
- **User:** 
  - user tidak boleh dihapus, hanya bisa dinonaktifkan.
  - satu user bisa memiliki banyak device.
- **Item & Barcode:** 
`itemId` [PK] bersifat Immutable. Satu Item bisa memiliki banyak Barcode (1-N).
`itemId` berbeda dengan `barcode`, karena `barcode` adalah id external dan `itemId` adalah id internal.
- **Project:**
  - **ProjectHeader:**
    - satu `projectHeader` bisa memiliki banyak `projectDetail`.
    - satu `projectHeader` bisa memiliki banyak `projectResult`.
    - `dateStart` tidak boleh lebih dari `dateEnd`.
    - `siteCode` dan `brandCode` tidak boleh kosong.
    - kombinasi `siteCode`, `brandCode` tidak boleh ada di rentang waktu `dateStart` dan `dateEnd` yang sama.
    - saat sudah ada data di `projectResult` dan `projectDetail`, maka `projectHeader` tidak boleh diubah lagi.
    - **Anti-Hard Delete:** Dilarang menggunakan `DELETE`. Gunakan flag `isDeleted = true`.
  - **ProjectUser:**
    - kombinasi `projectId`, `username`, `deviceId` harus unik.
  - **ProjectDetail:**
    - kombinasi `projectId`, `barcode` harus unik.
  - **ProjectResult:** (Transaction Table) 
    - project result berfungsi sebagai history scan.
    - project result adalah streaming data dari mobile device, dimana saat project berlangsung user bisa scan barcode yang sama berkali-kali.
    - kombinasi `projectId`, `deviceId`, `timestamp` harus unik.
    - `timestamp` harus unik di dalam satu `projectId` dan `deviceId` untuk keperluan konsistensi data saat syncronisasi data (syncronisasi data tidak boleh ada duplikasi) (karena ada kemungkinan try again).
    - Gunakan `UPSERT` logic (Update if exist, Insert if new) untuk `scannedQty`.
    - `projectResult` bersifat read-only, dan tidak boleh dimodifikasi user.

### 🛡️ Global Data Rules
- **Audit Trail:** Setiap mutasi data (Insert/Update) pada Project dan Item wajib mencatat `createdBy`, `createdAt`, `updatedBy`, `updatedAt`.
- **Transactions:** Semua operasi yang melibatkan `ProjectHeader`, `ProjectDetail` dan `ProjectResult` secara bersamaan wajib dibungkus dalam **Database Transaction**.`
---
## Data Contract Rules

### DbContract
`DbContract` adalah satu-satunya sumber kebenaran (Single Source of Truth)
untuk:
- Nama tabel database
- Jika nama tabel tidak mengirfomasikan schema, maka akan digunakan schema public
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
## Fitur
- user harus login untuk bisa akses program ini
- Dashboard
  - menampilkan jumlah user aktif, device aktif, item aktif
  - menampilkan jumlah project yang sedang berjalan
- CRUD  
  - User
    - hanya admin yang akses program ini
  - Device
    - hanya admin yang akses program ini
  - Item
    - hanya admin yang bisa create, update dan Soft Delete
    - menampilkan daftar barcode untuk item yang dipilih
    - bisa upload item dari file CSV
    - format file CSV adalah sebagai berikut:
      - brandCode, barcode,itemId,article,material,color,size,name,description,category,price,sellPrice,discount,isSpecialPrice,stockQty,printQty,pricingId
      - contoh data:

        | brandCode | barcode | itemId | article | material | color | size | name | description | category | price | sellPrice | discount | isSpecialPrice | stockQty | printQty | pricingId |
        | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
        | FRN | 8991234000001 | FORM-COT-WHT-S | FORM01 | COTTON | WHITE | S | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 250000 | 0 | false | 50 | 0 | PRC01 |
        | FRN | 8991234000002 | FORM-COT-WHT-S | FORM01 | COTTON | WHITE | S | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 225000 | 0 | true | 10 | 0 | PRC01 |
        | FRN | 8991234000003 | FORM-COT-WHT-M | FORM01 | COTTON | WHITE | M | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 250000 | 0 | false | 45 | 0 | PRC01 |
        | FRN | 8991234000004 | FORM-COT-WHT-L | FORM01 | COTTON | WHITE | L | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 200000 | 50000 | false | 30 | 0 | PRC01 |
        | FRN | 8991234000005 | FORM-COT-BLK-S | FORM01 | COTTON | BLACK | S | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 250000 | 0 | false | 20 | 0 | PRC01 |
        | FRN | 8991234000006 | FORM-COT-BLK-M | FORM01 | COTTON | BLACK | M | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 250000 | 0 | false | 25 | 0 | PRC01 |


    - saat upload, sistem otomatis memasukkan data ke tabel item dan barcode
    - bisa memilih delimiter CSV (tab, comma, semicolon, pipe) (default: comma)
    - bisa dowload template item CSV
    - bisa memilih brandCode saat list data item
    - bisa filter berdasarkan text dan polihan kolom yang dipilih (article, name, category, description)
    - bisa filter berdasarkan barcode (full barcode)
  - Project
    - user bisa marking project sebagai completed
    - project yang sudah completed tidak bisa diubah, dan tidak bisa di set kembali menjadi non-completed
    - munculkan konfirmasi dialog ketika user marking project sebagai completed, dengan konfirmasi mengetikkan kode project.
    - saat marking project sebagai completed, system akan mengekseskusi URL API backend dengan method POST dengan nonce dan signature, dengan parameter projectId dan projectCode, dimana alamat url dikonfigurasi di file .env
    - ada parameter agar sistem tidak mengekseskusi API ini ketika user marking project sebagai completed di .env
    - buat dokumentasi untuk API ini di README.md
    - menampilkan daftar detail untuk project yang dipilih
    - menampilkan daftar result untuk project yang dipilih
    - menampilkan, menambah, menghapus daftar user untuk project yang dipilih (hanya admin yang bisa)
    - list project bisa difilter berdasarkan brandCode, siteCode, workingType, dateStart, dateEnd
    - user bisa upload item file csv dari DetailItem project, dan memilih delimiter CSV (tab, comma, semicolon, pipe) (default: comma) 
    - format file CSV adalah sebagai berikut (mirip pada upload item, namun tanpa brandCode:
      - barcode,itemId,article,material,color,size,name,description,category,price,sellPrice,discount,isSpecialPrice,stockQty,printQty,pricingId
    - saat upload, sistem otomatis memasukkan data ke tabel item dan barcode, dengan brandCode sesuai project yang dipilih
    - contoh data:

      | barcode | itemId | article | material | color | size | name | description | category | price | sellPrice | discount | isSpecialPrice | stockQty | printQty | pricingId |
      | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
      | 8991234000001 | FORM-COT-WHT-S | FORM01 | COTTON | WHITE | S | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 250000 | 0 | false | 50 | 0 | PRC01 |
      | 8991234000002 | FORM-COT-WHT-S | FORM01 | COTTON | WHITE | S | Kemeja Formal Slim Fit | Bahan katun stretch | Baju Formal | 250000 | 225000 | 0 | true | 10 | 0 | PRC01 |
    - bisa download template item CSV sesuai format disini  
    - buat juga fitur pencarian di project detail dan project result seperti pada item   
    - tampilkan dalam tab dan paging yang rapi
    - pada project result, bisa filter text 

- Summary Project
  - menampilkan ringkasan project yang dipilih, group by itemId
  - bisa filter data berdasar itemId, article, name, description
  - download ringkasan project dalam format CSV, delimiter bisa dipilih (default: comma)



---
## Instruksi Khusus untuk AI
1. Jika saya meminta fitur baru, selalu prioritaskan aspek **keamanan** dan **integritas data**.
2. Berikan contoh kode yang sudah menyertakan **logging** dan **error handling**.
3. Jika ada perubahan skema database, ingatkan saya untuk melakukan migrasi pada PostgreSQL 16.
4. Gunakan gaya bahasa yang profesional dan teknis dalam Bahasa Indonesia.
