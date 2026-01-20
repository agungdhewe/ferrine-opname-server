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
- dateStart (DATE)
- dateEnd (DATE)
- description (TEXT)
- workingType (TEXT)
- disabled (BOOL)
- siteCode (TEXT)
- brandCode (TEXT)

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
