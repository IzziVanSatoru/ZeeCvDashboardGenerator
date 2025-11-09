# Zeedashboardskiw

## Deskripsi Singkat
**Zeedashboardskiw** adalah projek dashboard CV generate untuk buat CV atas 

---

## Fitur Utama
- **Login & Verifikasi User (Firebase)**  
- **Halaman Dashboard Dinamis** setelah login  
- **Struktur Modular** dengan App Router (`app/`)  
- **Tampilan Estetis & Responsif**  

---

## Struktur Folder
```
zeedashboardskiw/
├── app/
│   ├── layout.jsx              # Layout utama (wrapper semua halaman + Footer)
│   ├── page.jsx                # Halaman Login / Landing Page
│   ├── dashboard/
│   │   └── page.jsx            # Dashboard utama (setelah login)
│   └── api/
│       └── verify-user/
│           └── route.js        # API verifikasi user (Firebase)
├── components/                 # Komponen UI reusable
├── styles/                     # File CSS global (App.css)
├── package.json
└── README.md
```

---

## Alur Aplikasi (Flow Chart)

```
+--------------------+
|   User Buka App    |
+--------------------+
          |
          v
+--------------------+
|   Halaman Login    |
+--------------------+
          |
          v
+------------------------------+
| API /verify-user (Firebase)  |
+------------------------------+
          |
          v
+--------------------+
|   Dashboard Page   |
+--------------------+
          |
          v
+--------------------+
|   cave genrator   |
+--------------------+
```

---

## Cara Menjalankan Proyek

### 1. Clone repository
```bash
git https://github.com/IzziVanSatoru/ZeeCvDashboardGenerator.git
cd ZeeCvDashboardGenerator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Jalankan aplikasi
```bash
npm run dev
```
Lalu buka di browser: [http://localhost:3000](http://localhost:3000)

---


## Teknologi yang Digunakan
- **Next.js 14 (App Router)**
- **React 18**
- **Firebase Auth API**
- **Open router ai model Chat gpt o4 mini**
- **CSS (App.css)**

---

## Pembuat
**izziVanSatoru**

## Note
model ai nya dari open roueter bisa di custom sendiri model ai bisa pake model ai apa aja di open router dan biasain pake api sendiri karena model nya pake sistem BYOK di open router