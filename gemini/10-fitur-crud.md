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
    - bisa memilih delimiter CSV (default: comma)
    - bisa memilih brandCode saat list data item
    - bisa filter berdasarkan text dan polihan kolom yang dipilih (article, name, category, description)
  - Project
    - menampilkan daftar detail untuk project yang dipilih
    - menampilkan daftar result untuk project yang dipilih
    - menampilkan, menambah, menghapus daftar user untuk project yang dipilih
    - list project bisa difilter berdasarkan brandCode, siteCode, workingType, dateStart, dateEnd
    - tampilkan dalam tab dan paging yang rapi
    - pada project result, bisa filter text 
- Summary Project
  - menampilkan ringkasan project yang dipilih, group by itemId
  - download ringkasan project dalam format CSV, delimiter bisa dipilih (default: comma)


