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
    - menampilkan daftar detail untuk project yang dipilih
    - menampilkan daftar result untuk project yang dipilih
    - menampilkan, menambah, menghapus daftar user untuk project yang dipilih
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
  - download ringkasan project dalam format CSV, delimiter bisa dipilih (default: comma)


