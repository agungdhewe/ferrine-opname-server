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