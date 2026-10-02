# 🚀 TechMint + Arolinks Safelink Analysis & Implementation Engine

Welcome to the dedicated **TechMint Safelink Analysis & Implementation** module.

This folder contains the complete reverse-engineering, scraping tools, ad setups, and plug-and-play code to replicate the **2-step / 3-step high-revenue safelink redirection system** seen on `techmint.in` and `arolinks.com`.

---

## 📁 Directory Structure

```text
techmint-analysis/
├── README.md                      # Overview & Quick Start Guide
├── SYSTEM_ARCHITECTURE.md         # Detailed breakdown of the redirection lifecycle
├── scrapers/
│   ├── techmintScraper.cjs        # Scraper for TechMint's high-CPC articles & images
│   └── output/
│       └── techmint_posts.json    # Scraped articles ready for import
├── safelink-engine/
│   ├── TechmintSafelinkWidget.jsx # Drop-in React widget (Verify, Timer, Continue)
│   ├── techmint-widget.css        # Authentic TechMint CSS styling & buttons
│   └── safelinkController.js      # Express backend router (2-step & 3-step logic)
├── ad-setup/
│   └── AdManagerConfig.js         # Google Ad Manager (GPT) & Rewarded Ad setup
├── steps_trace/                   # Raw HTML captures of every redirect step
└── test_sequence.cjs              # Automated script to simulate the live flow
```

---

## ⚡ Key Mechanisms Discovered

1. **Shortlink Ingress (`arolinks.com/BMKrQ`)**:
   - Immediately redirects via JavaScript:
     `window.location.href = "https://techmint.in/studyeducations/?universtityeducations=BMKrQ&uiso=174512&st=1"`

2. **Step 1 Landing (`techmint.in/studyeducations/`)**:
   - Initializes a session (`PHPSESSID`) and sets high-CPC tracking cookie `uopusi` (`education,loan,insurance,jobvacancy`).
   - Displays a brief loading screen ("Generating... Please wait") and forwards to an article with high advertising RPM (e.g., *Online MBA*, *Student Loans*, *LASIK Surgery*).

3. **In-Article Engagement & Verification**:
   - **Countdown Timer (`#ce-wait1`)**: 20-24 seconds duration.
   - **Iframe Ad Click Detector**: If the visitor clicks on any ad iframe, it sets `adcadg` cookie and cuts the timer down to 5 seconds, heavily encouraging ad engagement!
   - **Verify Button (`#btn6`)**: Appears when timer hits 0.
   - **Auto-Scroll & Continue (`#btn7`)**: Clicking Verify reveals `#btn7` at the bottom of the article surrounded by ads and scrolls the user down.

4. **Multi-Step Redirection (`/readmore/`)**:
   - User clicks Continue (`/readmore/`).
   - Server inspects session state:
     - If Step 1 -> increments to `st=2` and forwards to Article 2.
     - If Step 2 -> if 2-step configured, unlocks destination link; if 3-step, forwards to Article 3.

5. **Rewarded Ad Overlay (Popup Trigger)**:
   - After 35 seconds of inactivity, a gradient overlay appears:
     *"⚠️ Action Required: Click Continue and watch a 10-second ad to unlock the link"*.
   - Triggers Google Ad Manager out-of-page rewarded ad format.

---

## 🛠️ How to Use This in Your Project

### 1. Run the Scraper to Fetch High-CPC Articles
To scrape fresh articles from TechMint:
```bash
node techmint-analysis/scrapers/techmintScraper.cjs
```
This saves clean titles, content, categories, and images into `techmint-analysis/scrapers/output/techmint_posts.json`.

### 2. Use the React Safelink Widget
Import `TechmintTopWidget` and `TechmintBottomWidget` in your article page (e.g. `src/pages/PostDetail.jsx`):
```jsx
import { TechmintTopWidget, TechmintBottomWidget } from '../techmint-analysis/safelink-engine/TechmintSafelinkWidget';
import '../techmint-analysis/safelink-engine/techmint-widget.css';

// At the top of your post content:
<TechmintTopWidget
  currentStep={currentStep}
  totalSteps={2} // or 3
  onVerify={() => setStepVerified(true)}
/>

// At the bottom of your post content:
<TechmintBottomWidget
  currentStep={currentStep}
  totalSteps={2}
  isUnlocked={stepVerified}
  onContinue={handleNextStep}
/>
```

### 3. Mount the Backend Redirection Router
In your `server/server.js`:
```javascript
const safelinkRouter = require('./techmint-analysis/safelink-engine/safelinkController');
app.use('/api/safelink', safelinkRouter);
```
