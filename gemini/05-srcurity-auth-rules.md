## 🔐 Security & Auth Rules (Strict)
1. **No Anonymous Access:** Semua endpoint (kecuali `/login`) wajib melewati Middleware Autentikasi.
2. **RBAC (Role-Based Access Control):** Pengecekan flag user (`isAdmin`, `allowOpname`, dll) dilakukan di level middleware sebelum masuk ke controller.
3. **Token Revocation:** Gunakan Redis untuk menyimpan 'Blacklisted Tokens' saat user logout atau akun di-disable.
4. **Credential Safety:** Dilarang hardcode kredensial. Gunakan `.env`.