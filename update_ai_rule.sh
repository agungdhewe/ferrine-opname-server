#!/bin/bash

# Target file
TARGET_FILE="GEMINI.md"
GEMINI_DIR="gemini"

# 1. Menuliskan beberapa baris text langsung
echo "# 🤖 GEMINI Context Guide: StockOpname Server" > "$TARGET_FILE"
echo "Dokumen ini adalah panduan konteks bagi asisten AI (Gemini) untuk memahami aturan, standar, dan arsitektur proyek Backend Stock Opname ini. Semua saran kode dan pengembangan fitur wajib mematuhi ketentuan di bawah ini." >> "$TARGET_FILE"
echo "---" >> "$TARGET_FILE"
echo "" >> "$TARGET_FILE"

# 2. Menggabungkan content dari file-file yang ada di direktori gemini
if [ -d "$GEMINI_DIR" ]; then
    # Mengambil daftar file, diurutkan secara abjad, lalu diloop
    for file in $(ls -1 "$GEMINI_DIR"/*); do
        if [ -f "$file" ]; then
            echo "---" >> "$TARGET_FILE"
            cat "$file" >> "$TARGET_FILE"
            echo "" >> "$TARGET_FILE"
        fi
    done
fi

echo "Updated $TARGET_FILE successfully."
