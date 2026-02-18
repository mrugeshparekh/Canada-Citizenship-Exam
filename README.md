# Citizenship Practice Exam (Webpack + TypeScript + Bootstrap)

No `react-scripts`, no Vite. This is a plain **React + TypeScript** SPA bundled with **Webpack 5** and styled with **Bootstrap 5**.

## Features
- Random **20 questions** per attempt (from `src/data/questions.json`)
- **45 minutes** timer (auto-submit at 0)
- **Passing is 75%** (15/20)
- Bootstrap progress bar
- Review shows **your selected option text** and **correct option text**

## Run locally
```bash
npm install
npm start
```
Dev server runs on http://localhost:5173

## Build
```bash
npm run build
```
Output is in `dist/`.

## Deploy to GitHub Pages
This project supports a repo subpath via `PUBLIC_URL`.

### Option A (recommended): set PUBLIC_URL when deploying
```bash
PUBLIC_URL="/<repo-name>/" npm run deploy
```
Example:
```bash
PUBLIC_URL="/citizenship-quiz/" npm run deploy
```

### Option B: set a GitHub Pages custom domain/root
If you're deploying to root, you can skip PUBLIC_URL.

After deploy, enable GitHub Pages for the `gh-pages` branch.


## Fix for ts-loader “TypeScript emitted no output”
This happens when `tsconfig.json` has `noEmit: true`. This project sets `noEmit: false` so Webpack can transpile TS.
