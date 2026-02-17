# FallSec Portfolio

Portfolio website dengan frontend statis dan backend feedback Telegram.

## Struktur Singkat

- Frontend: HTML/CSS/JS statis (deploy ke GitHub Pages).
- Backend: `api/feedback.js` (deploy ke Vercel).

## Deploy Frontend (GitHub Pages)

1. Push repo ke GitHub.
2. Buka repo → Settings → Pages.
3. Source: `Deploy from a branch`.
4. Branch: `main`, Folder: `/root`.
5. Simpan, tunggu URL Pages aktif.

## Deploy Backend (Vercel)

1. Buat project baru di Vercel dari repo yang sama.
2. Set Environment Variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `ALLOWED_ORIGINS` (opsional)
     - contoh: `https://username.github.io/portfolio`
3. Deploy. Endpoint akan tersedia di:
   - `https://<vercel-app>.vercel.app/api/feedback`

## Integrasi Form Feedback

Ganti `action` pada form feedback di `index.html` ke URL backend Vercel, contoh:

```html
<form class="feedback-form" action="https://<vercel-app>.vercel.app/api/feedback" method="POST">
```

## Catatan

GitHub Pages tidak menjalankan `server.js`. Gunakan `api/feedback.js` di Vercel untuk endpoint feedback.
