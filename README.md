# Timesheet Generator - Chrome Extension

Extension untuk generate timesheet bulanan otomatis: tanggal terisi, weekend & hari libur nasional
otomatis diwarnai, deskripsi libur diambil dari `api-hari-libur.vercel.app`.

## Cara Install (Load Unpacked)

1. Extract folder ini.
2. Buka Chrome -> ketik `chrome://extensions` di address bar.
3. Aktifkan **Developer mode** (pojok kanan atas).
4. Klik **Load unpacked**, lalu pilih folder `timesheet-extension`.
5. Ikon extension akan muncul di toolbar Chrome.

## Cara Pakai

1. Klik ikon extension.
2. Pilih **Bulan & Tahun**, lalu klik **Cek Hari Libur** untuk melihat daftar tanggal merah bulan itu.
3. Upload **Template Timesheet (.xlsx)** — bisa upload beberapa template berbeda (misal per klien
   atau per project). Setiap upload akan diminta nama label untuk template itu, lalu tersimpan
   permanen di daftar **Template Tersimpan**. Template harus punya satu baris header berisi:
   `Date, Clock In, Clock Out, Total Hour, Status Attendance, Project Name, WFO/WFH, Overtime,
   Work Detail, Remarks` (urutan kolom bebas).
4. Di daftar **Template Tersimpan**, pilih (klik radio button) template mana yang mau dipakai untuk
   generate. Klik ✕ di sebelah kanan untuk menghapus template yang tidak dipakai lagi.
5. Klik **Generate Timesheet** — file baru untuk bulan yang dipilih otomatis terdownload, dengan:
   - Tanggal terisi sesuai jumlah hari di bulan tersebut.
   - Baris weekend & hari libur nasional otomatis diwarnai merah muda (mengikuti warna template).
   - Kolom Remarks pada hari libur nasional otomatis terisi deskripsi liburnya.
   - Clock In/Out, Status, Project, WFO/WFH dikosongkan (isi manual per hari kerja).
   - "Total Mandays" otomatis dihitung dari jumlah "P" di kolom Status Attendance (formula, update
     otomatis setelah kamu isi manual).

## Catatan

- Extension butuh akses internet ke `api-hari-libur.vercel.app` untuk data hari libur.
- Kalau API sedang down, generate tetap jalan tanpa isi Remarks hari libur (hanya weekend yang
  terwarnai).
- Format template fleksibel selama nama header di atas ada persis di satu baris (urutan kolom
  bebas).
