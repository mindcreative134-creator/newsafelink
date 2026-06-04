# SarkariTrend — Safelink Portal

**SarkariTrend** is a premium, high-performance headless Safelink gateway portal powered by **React 18**, **Tailwind CSS**, and the **Google Blogger API v3**. It features a fully AdSense-compliant 3-step verification flow, elegant shimmer loading skeletons, dark/light mode, and SEO-optimized routing.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **3-Step Gateway** | Sequential post-based verification (Step 1 → 2 → 3) before the final redirect |
| **Shimmer Skeletons** | Beautiful shimmer placeholders instead of spinners for layout stability |
| **AdSense Ready** | Inline + sidebar ad slots that are policy-compliant (no "Advertisement" label text) |
| **Dark / Light Mode** | System-aware with localStorage persistence |
| **SEO Optimized** | Dynamic titles, meta descriptions, Open Graph tags, and canonical URLs per page |
| **Category Archive** | Auto-generated from Blogger post labels |
| **Safelink Flow** | `?url=` and `?o=` query parameters with Base64 decoding support |

---

## ⚙️ Configuration

To connect your own Blogger blog, edit the API config in:  
**`src/services/bloggerApi.js`**

```javascript
const API_KEY = 'YOUR_GOOGLE_BLOGGER_API_KEY';
const BLOG_ID = 'YOUR_BLOGGER_BLOG_ID';
```

To change the AdSense publisher ID, search for:  
`ca-pub-9543073887536718` across the project and replace with your own Publisher ID.

---

## 🔗 Safelink URL Formats

### Direct URL Redirect
```
https://yourdomain.com/?url=https://example.com
```

### Base64 Encoded Redirect
```
https://yourdomain.com/?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==
```
*(Decodes `aHR0cHM6Ly9leGFtcGxlLmNvbQ==` → `https://example.com`)*

### Short Link Service (Piko)
```
https://yourdomain.com/?o=YOUR_PIKO_CODE
```
*(Redirects through `https://piko.site.je/?o=YOUR_PIKO_CODE`)*

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Portal runs at: **http://localhost:5173/**

### 3. Build for Production
```bash
npm run build
```
Outputs optimized assets to the `/dist` folder.

---

## 📤 GitHub Upload Instructions

Follow these steps to push the project to GitHub:

### First Time Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit everything
git commit -m "feat: initial SarkariTrend safelink portal"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to main branch
git push -u origin main
```

### Subsequent Updates
```bash
git add .
git commit -m "fix: describe your changes here"
git push
```

> **Tip:** Never commit your `node_modules/` — the `.gitignore` already excludes it.

---

## ⚡ Vercel Deployment Instructions

### Step 1 — Import Project on Vercel
1. Go to **[vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Select your GitHub repository

### Step 2 — Configure Build Settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3 — Client-Side Routing (SPA Rewrites)

A `vercel.json` is already included at the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router paths (e.g., `/post/:id`, `/category/:label`) don't return 404 on page refresh.

### Step 4 — Deploy!
Click **"Deploy"**. Vercel will build and publish automatically.

### Auto-Deploy on Push
After the initial deployment, any `git push` to your `main` branch will automatically trigger a new build and deploy on Vercel.

---

## 📁 Project Structure

```
theam/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── Header.jsx   # Sticky navigation with dark mode toggle
│   │   ├── Footer.jsx   # 3-column footer with legal links
│   │   ├── Sidebar.jsx  # About, categories, ads, recent posts
│   │   └── StepHeader.jsx  # Safelink step progress banner
│   ├── context/
│   │   └── SafelinkContext.jsx  # Global safelink state management
│   ├── pages/
│   │   ├── Home.jsx     # Hero + post grid + safelink check widget
│   │   ├── PostDetail.jsx  # Article + safelink 3-step timer
│   │   ├── Category.jsx    # Category archive page
│   │   └── StaticPages.jsx # About, Contact, Privacy, Disclaimer, ToS
│   ├── services/
│   │   └── bloggerApi.js  # Blogger API v3 integration
│   ├── App.jsx
│   ├── index.css        # Global styles
│   └── main.jsx
├── index.html           # Entry HTML with AdSense, fonts, Tailwind CDN
├── vercel.json          # SPA rewrites for Vercel
├── vite.config.js
└── package.json
```

---

## 🛡️ AdSense Policy Notes

- Ad slots use `data-ad-format="auto"` with `data-full-width-responsive="true"`
- No "Advertisement" or ad label text is shown (policy compliant)
- Ads are injected between content paragraphs in `PostDetail.jsx` and in the sidebar
- Publisher ID: `ca-pub-9543073887536718` (replace with your own)
- Ad Slot ID: `7317709042` (replace with your own)
