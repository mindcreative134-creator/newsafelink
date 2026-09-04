# Multi-Feed Blogger Auto-Publisher Backend Server

Yeh backend server 5-6 alag-alag sites/RSS feeds se data auto-fetch karta hai aur formatting ke saath aapke Google Blogger blog par post karta hai. Isko aap **Render.com** par free host kar sakte hain.

---

## Features

1. **Multi-Source Fetching & Web Scraping**: 5-6 ya jitni chahe sites se RSS feeds ke alawa **Direct Web Scraping** (Cheerio / BeautifulSoup style) se bina RSS wali sites ka HTML bhi scrape kar sakta hai.
2. **AdSense Safe Formatting**: Posts me proper heading tags (`<h2>`, `<h3>`), clean HTML tables, Important Dates, Eligibility, aur "How to Apply" steps auto-generate hote hain bina kisi misleading text ya AdSense violation ke.
3. **Automated Cron Jobs**: Har 2 ghante me (configurable) automatically latest updates check karta hai aur naye articles publish karta hai (duplicate posts skip hote hain).
4. **Interactive Dashboard UI**: Server ke root URL (`http://localhost:5000` ya aapke Render URL) par ek clean dashboard milta hai jahan se aap:
   - Target feeds/sites dekh sakte hain aur nayi site add kar sakte hain (RSS ya Direct Web Scraper).
   - **"Sync Now"** button daba kar turant saari sites se data fetch kar sakte hain.
   - Live activity logs dekh sakte hain.
5. **Simulation & Live Mode**: Agar Blogger OAuth setup nahi bhi kiya hai, tab bhi preview mode me fetch karke test karta hai bina crash hue.

---

## Render.com Par Host Karne Ka Step-by-Step Tarika

### Step 1: Render.com par Login karein
1. [Render.com](https://render.com) par jayein aur apne GitHub account se login karein.

### Step 2: New Web Service Banayein
1. Dashboard me **"New +"** button par click karein aur **"Web Service"** chunein.
2. Apna repository select karein: `mindcreative134-creator/newsafelink`.

### Step 3: Settings Configure Karein
Neeche diye gaye settings daalein:
- **Name**: `newsafelink-backend` (ya jo naam aap chahein)
- **Region**: Singapore ya Frankfurt (jo paas ho)
- **Branch**: `main`
- **Root Directory**: `server`   👈 *(Important: isme `server` likhein)*
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Instance Type**: `Free`

### Step 4: Environment Variables (Optional / As needed)
Agar aap Blogger auto-publishing enable karna chahte hain, toh Render ke **Environment** tab me yeh variables add karein:
- `PORT` = `10000` (Render default)
- `BLOGGER_BLOG_ID` = `6924208631263306852`
- `BLOGGER_CLIENT_ID` = *(Google Cloud Console OAuth Client ID)*
- `BLOGGER_CLIENT_SECRET` = *(Google Cloud Console Client Secret)*
- `BLOGGER_REFRESH_TOKEN` = *(OAuth Refresh Token with Blogger API scope)*
- `CRON_SCHEDULE` = `0 */2 * * *` (Har 2 ghante me chalne ke liye)

### Step 5: Deploy
- **"Deploy Web Service"** par click karein.
- 1-2 minute me server live ho jayega aur aapko ek Render URL mil jayega (jaise `https://newsafelink-backend.onrender.com`).
- Us URL ko open karke aap direct dashboard dekh sakte hain aur "Sync Now" se fetch test kar sakte hain!

---

## Local Run Karne Ka Tarika

```bash
cd server
npm install
node server.js
```
Browser me open karein: `http://localhost:5000`
