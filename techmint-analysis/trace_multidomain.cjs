const fs = require('fs');
const path = require('path');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

class MultiDomainClient {
  constructor() {
    this.domainCookies = {}; // domain -> { key: val }
    this.history = [];
  }

  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  getCookieHeader(url) {
    const domain = this.getDomain(url);
    const cookies = this.domainCookies[domain] || {};
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  setCookies(url, headers) {
    const domain = this.getDomain(url);
    if (!this.domainCookies[domain]) this.domainCookies[domain] = {};

    let setCookie = null;
    if (typeof headers.getSetCookie === 'function') {
      setCookie = headers.getSetCookie();
    } else if (headers['set-cookie']) {
      setCookie = Array.isArray(headers['set-cookie']) ? headers['set-cookie'] : [headers['set-cookie']];
    }

    if (setCookie && Array.isArray(setCookie)) {
      for (const str of setCookie) {
        const parts = str.split(';')[0].split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          this.domainCookies[domain][k] = v;
        }
      }
    }
  }

  async get(url, referer = '') {
    const domain = this.getDomain(url);
    const cookieHeader = this.getCookieHeader(url);

    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
    };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (referer) headers['Referer'] = referer;

    console.log(`\n======================================================`);
    console.log(`GET ${url}`);
    console.log(`Domain: ${domain}`);
    console.log(`Referer: ${referer || 'none'}`);
    console.log(`Cookies: ${cookieHeader || 'none'}`);

    const res = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'manual'
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    this.setCookies(url, res.headers);
    console.log(`Active Cookies for ${domain}:`, this.domainCookies[domain]);

    const location = res.headers.get('location');
    const body = await res.text();
    if (location) console.log(`Location Header: ${location}`);

    return {
      url,
      status: res.status,
      location,
      headers: Object.fromEntries(res.headers.entries()),
      body
    };
  }
}

async function trace() {
  const client = new MultiDomainClient();
  const traceDir = path.join(__dirname, 'steps_multidomain');
  if (!fs.existsSync(traceDir)) fs.mkdirSync(traceDir, { recursive: true });

  let currentUrl = 'https://arolinks.com/BMKrQ';
  let referer = '';

  for (let i = 1; i <= 15; i++) {
    const res = await client.get(currentUrl, referer);
    fs.writeFileSync(path.join(traceDir, `step_${i}.html`), res.body);

    let nextUrl = res.location;
    if (!nextUrl) {
      // Find JS redirect
      const jsMatch = res.body.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i) ||
                      res.body.match(/window\.open\(['"]([^'"]+)['"]/i);
      if (jsMatch) {
        nextUrl = jsMatch[1];
        console.log(`[JS Redirect] -> ${nextUrl}`);
      }
    }

    if (!nextUrl) {
      // Look for btn7
      const btn7Match = res.body.match(/<a[^>]*id=['"]btn7['"][^>]*href=['"]([^'"]+)['"]/i) ||
                        res.body.match(/<a[^>]*href=['"]([^'"]*(?:readmore|step|verify|get-link)[^'"]*)['"]/i);
      if (btn7Match) {
        nextUrl = btn7Match[1];
        console.log(`[Button / Link found] -> ${nextUrl}`);
      }
    }

    if (!nextUrl) {
      console.log(`No automated or button redirect found in step ${i}. Stopping.`);
      // Print snippets of buttons/scripts
      const btns = [...res.body.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[0].replace(/\s+/g, ' '));
      console.log('Buttons:', btns);
      break;
    }

    if (nextUrl.startsWith('/')) {
      const u = new URL(currentUrl);
      nextUrl = `${u.origin}${nextUrl}`;
    }

    referer = currentUrl;
    currentUrl = nextUrl;
  }
}

trace().catch(console.error);
