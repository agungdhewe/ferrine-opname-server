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
