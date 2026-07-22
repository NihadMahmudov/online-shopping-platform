# 🚀 Render, Neon.tech və Cloudinary Quraşdırma Təlimatı

Bu layihə **Express.js + Vite** arxitekturası üzərində qurulub. Məlumatlar **Neon.tech (PostgreSQL)** verilənlər bazasında, yüklənən şəkillər relates isə **Cloudinary** servisinde saxlanılır və şəkil linkləri Neon bazasına yazılır. Tətbiq isə **Render.com** platformasında yerləşdirilir (deploy edilir).

---

## 🛠️ 1. Neon.tech (PostgreSQL) Bazasının Yaradılması

1. [Neon.tech](https://neon.tech) saytına daxil olun və hesab açın.
2. **New Project** düyməsini sıxın və yeni verilənlər bazası layihəsi yaradın (məsələn: `atlasmall-db`).
3. Dashboard hissəsindən **Connection Details** bölümünə keçin.
4. **Connection String** hissəsindən PostgreSQL bağlantı xəttini kopyalayın (SSL aktiv olmalıdır):
   ```
   postgresql://user:password@ep-xxxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Bu bağlantı linki sizin `DATABASE_URL` mühit dəyişəniniz (Environment Variable) olacaq.

> 💡 **Qeyd:** Server işə düşdükdə Neon.tech bazanızda cədvəllər (`products`, `categories`, `stores`, `orders`, `notifications`, `users`) və ilkin məhsullar avtomatik olaraq yaradılacaq!

---

## 🖼️ 2. Cloudinary Hesabının Quraşdırılması

1. [Cloudinary.com](https://cloudinary.com) saytına daxil olun və pulsuz hesab açın.
2. Dashboard bölümünə daxil olun və aşağıdakı 3 məlumatı kopyalayın:
   - **Cloud Name**: (məs: `dxy123456`)
   - **API Key**: (məs: `123456789012345`)
   - **API Secret**: (məs: `abcde12345xxxxx`)

Bu məlumatlar məhsul əlavə edərkən şəkillərin Cloudinary-ə yüklənməsini və həmin Cloudinary URL-lərinin Neon bazasında saxlanmasını təmin edir.

---

## 🌐 3. Render.com Platformasında Deploy Etmək

1. [Render.com](https://render.com) saytına daxil olun.
2. **New +** düyməsinə sıxıb **Web Service** seçimini edin.
3. GitHub hesabınızı bağlayın və `NihadMahmudov/online-shopping-platform` reposunu seçin.
4. Parametrləri aşağıdakı kimi təyin edin:
   - **Name**: `atlasmall-backend` (və ya istədiyiniz ad)
   - **Region**: Frankfurt (EU) və ya sizə yaxın region
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`

5. **Environment Variables** (Mühit dəyişənləri) bölməsinə aşağıdakıları əlavə edin:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require` |
| `CLOUDINARY_CLOUD_NAME` | `sizin_cloud_name` |
| `CLOUDINARY_API_KEY` | `sizin_api_key` |
| `CLOUDINARY_API_SECRET` | `sizin_api_secret` |

6. **Create Web Service** düyməsini sıxın. Deploy tamamlandıqdan sonra tətbiqiniz canlı olacaq!

---

## 📡 4. Backend API Endpoints (İstifadə üçün)

Tətbiqinizdə aşağıdakı backend API marşrutları mövcuddur:

- `GET /api/health` — Baza və Cloudinary qoşulma statusunu yoxlayır.
- `POST /api/upload` — Şəkili Cloudinary-ə yükləyir və Cloudinary `secure_url` qaytarır.
- `GET /api/products` — Neon PostgreSQL bazasından məhsulları gətirir.
- `POST /api/products` — Şəkil linki ilə birgə yeni məhsulu Neon PostgreSQL bazasına yazır.
- `DELETE /api/products/:id` — Məhsulu bazadan silir.
- `GET /api/categories` — Kateqoriyaları gətirir.
- `GET /api/stores` — Mağazaları gətirir və yeniləyir.
- `POST /api/orders` — Sifarişləri bazada saxlayır.

---

## 🧪 Local Yoxlama (.env Faylı)

Local mühitdə test etmək üçün layihənin kök qovluğunda `.env` faylı yaradın:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require
CLOUDINARY_CLOUD_NAME=sizin_cloud_name
CLOUDINARY_API_KEY=sizin_api_key
CLOUDINARY_API_SECRET=sizin_api_secret
PORT=3000
```

`npm run dev` əmri ilə serveri başladın!
