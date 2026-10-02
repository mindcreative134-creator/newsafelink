const fs = require('fs');
const path = require('path');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

class BrowserClient {
  constructor() {
    this.cookies = {};
    this.steps = [];
  }

  getCookieString() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  setCookiesFromHeaders(headers) {
    let setCookie = null;
    if (typeof headers.getSetCookie === 'function') {
      setCookie = headers.getSetCookie();
    } else if (headers['set-cookie']) {
      setCookie = Array.isArray(headers['set-cookie']) ? headers['set-cookie'] : [headers['set-cookie']];
    }

    if (setCookie && Array.isArray(setCookie)) {
      for (const cookieStr of setCookie) {
        const parts = cookieStr.split(';')[0].split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          this.cookies[key] = val;
        }
      }
    }
  }

  async get(url, referer = '') {
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
    };
    const cookieHeader = this.getCookieString();
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (referer) headers['Referer'] = referer;

    console.log(`\n========================================`);
    console.log(`FETCH: ${url}`);
    console.log(`REFERER: ${referer || 'none'}`);
    console.log(`COOKIES SENT: ${cookieHeader || 'none'}`);

    const res = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'manual'
    });

    console.log(`STATUS: ${res.status} ${res.statusText}`);
    this.setCookiesFromHeaders(res.headers);
    console.log(`ACTIVE COOKIES:`, this.cookies);

    const location = res.headers.get('location');
    const body = await res.text();

    return {
      url,
      status: res.status,
      location,
      headers: Object.fromEntries(res.headers.entries()),
      body
    };
  }

  findNextUrl(res) {
    if (res.location) return res.location;
    // Check JS redirects
    const jsMatches = [
      /window\.location\.href\s*=\s*["']([^"']+)["']/i,
      /document\.location\.href\s*=\s*["']([^"']+)["']/i,
      /window\.location\s*=\s*["']([^"']+)["']/i,
      /location\.href\s*=\s*["']([^"']+)["']/i,
      /window\.open\(["']([^"']+)["']/i
    ];
    for (const r of jsMatches) {
      const match = res.body.match(r);
      if (match && match[1]) {
        return match[1];
      }
    }
    // Check meta refresh
    const metaMatch = res.body.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^;]*;\s*url=([^"']+)["']/i);
    if (metaMatch) return metaMatch[1];

    // Check specific buttons or links like btn7 or /readmore
    const readMoreMatch = res.body.match(/<a[^>]*id=["']btn7["'][^>]*href=["']([^"']+)["']/i) ||
                          res.body.match(/<a[^>]*href=["']([^"']*(?:readmore|studyeducations)[^"']*)["']/i);
    if (readMoreMatch) return readMoreMatch[1];

    return null;
  }
}

async function analyze() {
  const stepsDir = path.join(__dirname, 'steps');
  if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir, { recursive: true });

  const client = new BrowserClient();
  let currentUrl = 'https://arolinks.com/BMKrQ';
  let referer = '';

  for (let step = 1; step <= 10; step++) {
    const res = await client.get(currentUrl, referer);
    const filename = `step_${step}.html`;
    fs.writeFileSync(path.join(stepsDir, filename), res.body);

    console.log(`Saved step ${step} (${res.body.length} bytes) -> ${filename}`);

    // Inspect buttons, timers, forms
    const btns = [...res.body.matchAll(/<button[^>]*>[\s\S]*?<\/button>/gi)].map(m => m[0]);
    if (btns.length > 0) {
      console.log(`Buttons found (${btns.length}):`, btns.map(b => b.trim().slice(0, 100)));
    }

    const nextBtn7 = res.body.match(/<a[^>]*id=["']btn7["'][^>]*href=["']([^"']+)["']/i);
    if (nextBtn7) {
      console.log(`Found btn7 Link:`, nextBtn7[1]);
    }

    let next = client.findNextUrl(res);
    if (!next) {
      if (nextBtn7) {
        next = nextBtn7[1];
      } else {
        console.log(`No automated next URL detected. Checking forms or links...`);
        break;
      }
    }

    if (next.startsWith('/')) {
      const u = new URL(currentUrl);
      next = `${u.origin}${next}`;
    }

    console.log(`Next URL -> ${next}`);
    referer = currentUrl;
    currentUrl = next;
  }
}

analyze().catch(console.error);
