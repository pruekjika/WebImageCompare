# WebImageCompare

Site: https://pruekjika.github.io/WebImageCompare/

Compare two garden drone photos from [GardenImgDB](https://github.com/pruekjika/GardenImgDB) with a slider.

## How it loads images (no token)

ไม่ต้องใช้ token, `.env` หรือ GitHub secret แล้ว. Don't add a token back: anything in `VITE_*` is built
into the public site, so anyone can copy it (that's how the old tokens leaked).

- **Photo list + dates:** `ImageDB/index.json` from raw.githubusercontent.com
  (`[{"name": "0.webp", "date": "2022:09:08 17:21:38"}, ...]`). GardenImgDB's `main.py` and
  `batch_align.py` rewrite it, so commit it together with the new `.webp`.
- **Photos:** raw.githubusercontent.com. Not counted in the GitHub API rate limit.
- **If `index.json` can't be loaded:** falls back to the GitHub contents API without a token
  (60 requests/hour per visitor IP), and reads dates from each photo's EXIF.
- **360 gallery:** GardenImg360 through the GitHub contents API without a token, 1 request per visit.

## Develop

```
npm ci
npm run dev
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yaml`).
