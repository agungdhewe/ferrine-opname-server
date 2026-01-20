## 📊 Business Rules

### Core Tables & Integrity
- **Device:** 
  - device tidak boleh dihapus, hanya bisa dinonaktifkan.
- **User:** 
  - user tidak boleh dihapus, hanya bisa dinonaktifkan.
  - satu user bisa memiliki banyak device.
- **Item & Barcode:** 
`itemId` [PK] bersifat Immutable. Satu Item bisa memiliki banyak Barcode (1-N).
- **ProjectHeader:**
  - satu `projectHeader` bisa memiliki banyak `projectDetail`.
  - satu `projectHeader` bisa memiliki banyak `projectResult`.
  - `dateStart` tidak boleh lebih dari `dateEnd`.
  - `siteCode` dan `brandCode` tidak boleh kosong.
  - kombinasi `siteCode`, `brandCode` tidak boleh ada di rentang waktu `dateStart` dan `dateEnd` yang sama.
  - saat sudah ada data di `projectResult` dan `projectDetail`, maka `projectHeader` tidak boleh diubah lagi.
- **ProjectDetail:**
  - kombinasi `projectId`, `barcode` harus unik.
- **ProjectResult:** (Transaction Table) 
  - kombinasi `projectId`, `deviceId`, `timestamp` harus unik.
  - Gunakan `UPSERT` logic (Update if exist, Insert if new) untuk `scannedQty`.
  - `projectResult` bersifat read-only, dan tidak boleh dimodifikasi user.

### 🛡️ Global Data Rules
- **Anti-Hard Delete:** Dilarang menggunakan `DELETE`. Gunakan flag `disabled = true`.
- **Audit Trail:** Setiap mutasi data (Insert/Update) pada Project dan Item wajib mencatat `createdBy`, `createdAt`, `updatedBy`, `updatedAt`.
- **Transactions:** Semua operasi yang melibatkan `ProjectHeader`, `ProjectDetail` dan `ProjectResult` secara bersamaan wajib dibungkus dalam **Database Transaction**.`