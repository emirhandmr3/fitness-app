# Fitness App (Statik HTML/CSS/JS)

Kas anatomisi ve egzersizleri öğrenmek/tekrar etmek için modern, responsive bir statik web sitesi.

## Kurulum
```bash
git clone <repo-url>
cd fitness-app
```

## Çalıştırma
`fetch` kullandığı için `file://` yerine lokal sunucu gerekir:

```bash
python -m http.server 8000
```
Sonra `http://localhost:8000` adresini açın.

Alternatif: VS Code **Live Server**.

## Veri Güncelleme
- Yeni kas eklemek için: `data/muscles.json`
- Yeni hareket eklemek için: `data/exercises.json`

## Görsel Ekleme
- Kas görselleri: `images/muscles/`
- Hareket görselleri: `images/exercises/`
- JSON içinde ilgili `image` yolunu belirtin.

## GitHub Pages Deploy
1. GitHub repo → **Settings** → **Pages**
2. **Source** olarak `main` branch seçin
3. Root (`/`) klasörden yayınlayın

## Notlar
- Framework veya build tool yok.
- CDN bağımlılığı yok.
- Tema tercihi `localStorage` ile saklanır.
