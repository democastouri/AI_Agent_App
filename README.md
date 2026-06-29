# My App — Electron Desktop

Desktop wrapper for the Next.js app hosted on Vercel.
Tokens never live here — all API logic is on Vercel.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Vercel URL
Open `electron/main.js` and replace:
```js
const VERCEL_URL = 'https://your-app.vercel.app'
```

### 3. Set your GitHub repo info
Open `package.json` and update:
```json
"publish": {
  "owner": "YOUR_GITHUB_USERNAME",
  "repo": "YOUR_ELECTRON_REPO_NAME"
}
```

---

## Run locally (dev mode)

Make sure your Next.js app is running on localhost:3000 first, then:
```bash
npm run dev
```

---

## Build installers

```bash
npm run build:win    # → .exe installer
npm run build:mac    # → .dmg installer
npm run build:linux  # → .AppImage
```

Output goes to `dist/` folder.

---

## Release a new version

```bash
# 1. Bump version in package.json (e.g. 1.0.0 → 1.0.1)

# 2. Commit and tag
git add .
git commit -m "release v1.0.1"
git tag v1.0.1
git push origin main --tags

# GitHub Actions builds for all platforms automatically!
# Users get notified of the update inside the app.
```

---

## How auto-update works

1. User opens app
2. App silently checks GitHub Releases for a newer version
3. If found → popup shows with version + release notes
4. User clicks "Download & Install" → downloads in background with progress bar
5. When done → "Restart & Install" button appears
6. App restarts and installs the new version

---

## Project structure

```
electron-app/
├── electron/
│   ├── main.js        ← main process + auto-updater logic
│   ├── preload.js     ← secure bridge to renderer
│   └── update.html    ← update notification popup UI
├── assets/
│   ├── icon.icns      ← Mac icon (add your own)
│   ├── icon.ico       ← Windows icon (add your own)
│   └── icon.png       ← Linux icon (add your own)
├── .github/
│   └── workflows/
│       └── release.yml  ← auto build + publish on git tag
├── .gitignore
├── package.json
└── README.md
```
