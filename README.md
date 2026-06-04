# SarkariTrend News Safelink Portal

SarkariTrend News is a premium, high-performance headless safelink gateway portal powered by **React**, **Tailwind CSS**, and the **Google Blogger API v3**. It provides a fully AdSense-compliant validation gateway layout featuring a secure 3-step verification flow, elegant shimmer loading skeletons, and dark/light mode optimization.

---

## 🚀 Key Features

* **3-Step Security Verification**: Secure gateway routing that guides users sequentially through 3 posts (`currentStep` 1 -> 2 -> 3) before redirecting to the target URL.
* **Modern Shimmer Skeleton Screens**: Beautiful component placeholders loading instead of spinners for a fast, layout-stable, premium feel.
* **Color Contrast Override**: Integrated index-level CSS fixes to ensure inline text styling (often copied from external editors into Blogger) inherits correct theme colors, maintaining readability in both dark and light modes.
* **AdSense Policy Ready**: Structured ad slots designed to maximize revenue without explicitly injecting text indicators like `"Advertisement"`.
* **Dynamic SEO Meta & Routing**: Updates canonical links, titles, and meta descriptions dynamically per post on the fly.

---

## 🛠️ Redirection Mechanics (How it Works)

The safelink flow is triggered using standard query parameters on the homepage:

### 1. Direct Redirection Link
`http://localhost:5173/?url=https://example.com`
* Opens the gateway check, starts Step 1, and redirects directly to `https://example.com` after validation.

### 2. Base64 Encoded Redirect
`http://localhost:5173/?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ==`
* Automatically decodes the Base64 value (`aHR0cHM6Ly9leGFtcGxlLmNvbQ==`) back to `https://example.com` and executes the 3-step gateway safely.

---

## ⚙️ Configuration Details

To connect your own Blogger site, edit the API constants located in:
**[src/services/bloggerApi.js](src/services/bloggerApi.js)**

```javascript
const API_KEY = 'YOUR_GOOGLE_BLOGGER_API_KEY';
const BLOG_ID = 'YOUR_BLOGGER_BLOG_ID';
```

---

## 💻 Commands

Follow these scripts to run the portal locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Serves the local portal at: **[http://localhost:5173/](http://localhost:5173/)**

### 3. Build Production Bundle
```bash
npm run build
```
Generates optimized static build assets inside the `/dist` directory.

---

## ⚡ Vercel Deployment Instructions

To deploy this React + Vite SPA on **Vercel**, follow these configuration parameters:

### 1. Build and Output Settings
* **Framework Preset**: `Vite`
* **Build Command**: `npm run build` or `vite build`
* **Output Directory**: `dist`

### 2. Client-Side Routing (vercel.json)
We have included a **[vercel.json](vercel.json)** file in the root directory to handle client-side routing rewrites for Single Page Applications (SPAs):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This configuration redirects all request paths to `index.html`, letting React Router resolve the client-side paths (like `/post/:postId` or `/category/:label`) without triggering Vercel 404 errors.

