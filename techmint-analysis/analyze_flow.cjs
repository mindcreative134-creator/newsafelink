const fs = require('fs');
const path = require('path');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

class Session {
  constructor() {
    this.cookies = {};
    this.history = [];
  }

  getCookieString() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  setCookiesFromHeaders(headers) {
    // headers may be a Headers object or plain object
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
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': referer ? 'cross-site' : 'none',
      'Sec-Fetch-User': '?1',
    };
    const cookieHeader = this.getCookieString();
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (referer) headers['Referer'] = referer;

    console.log(`\n========================================`);
    console.log(`GET ${url}`);
    console.log(`Referer: ${referer || 'none'}`);
    console.log(`Cookies sent: ${cookieHeader || 'none'}`);

    const res = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'manual'
    });

    console.log(`Response Status: ${res.status} ${res.statusText}`);
    this.setCookiesFromHeaders(res.headers);
    console.log(`Active Cookies now:`, this.cookies);

    const location = res.headers.get('location');
    const text = await res.text();

    return {
      status: res.status,
      location,
      headers: Object.fromEntries(res.headers.entries()),
      body: text
    };
  }

  async post(url, data, referer = '') {
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Upgrade-Insecure-Requests': '1',
    };
    const cookieHeader = this.getCookieString();
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (referer) headers['Referer'] = referer;

    const bodyString = typeof data === 'string' ? data : new URLSearchParams(data).toString();

    console.log(`\n========================================`);
    console.log(`POST ${url}`);
    console.log(`Referer: ${referer || 'none'}`);
    console.log(`Cookies sent: ${cookieHeader || 'none'}`);
    console.log(`Post Data:`, bodyString);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString,
      redirect: 'manual'
    });

    console.log(`Response Status: ${res.status} ${res.statusText}`);
    this.setCookiesFromHeaders(res.headers);
    console.log(`Active Cookies now:`, this.cookies);

    const location = res.headers.get('location');
    const text = await res.text();

    return {
      status: res.status,
      location,
      headers: Object.fromEntries(res.headers.entries()),
      body: text
    };
  }
}

async function run() {
  const stepsDir = path.join(__dirname, 'steps');
  if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir, { recursive: true });

  const session = new Session();
  let stepIndex = 1;

  // Step 1: Initial arolinks URL
  let currentUrl = 'https://arolinks.com/BMKrQ';
  let referer = '';

  let stepRes = await session.get(currentUrl, referer);
  fs.writeFileSync(path.join(stepsDir, `step_${stepIndex}_arolinks.html`), stepRes.body);
  stepIndex++;

  // Check if there is JS redirect or location
  let nextUrl = stepRes.location;
  if (!nextUrl) {
    const jsRedirectMatch = stepRes.body.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);
    if (jsRedirectMatch) {
      nextUrl = jsRedirectMatch[1];
      console.log(`Found JS redirect to: ${nextUrl}`);
    }
  }

  // Step 2: Intermediate techmint redirect landing
  if (nextUrl) {
    referer = currentUrl;
    currentUrl = nextUrl;
    stepRes = await session.get(currentUrl, referer);
    fs.writeFileSync(path.join(stepsDir, `step_${stepIndex}_techmint_landing.html`), stepRes.body);
    stepIndex++;

    nextUrl = stepRes.location;
    if (!nextUrl) {
      const jsRedirectMatch = stepRes.body.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);
      if (jsRedirectMatch) {
        nextUrl = jsRedirectMatch[1];
        console.log(`Found JS redirect to: ${nextUrl}`);
      }
    }
  }

  // Step 3: Techmint article page
  if (nextUrl) {
    referer = currentUrl;
    currentUrl = nextUrl;
    stepRes = await session.get(currentUrl, referer);
    fs.writeFileSync(path.join(stepsDir, `step_${stepIndex}_techmint_article.html`), stepRes.body);
    stepIndex++;
    console.log(`Step 3 HTML length: ${stepRes.body.length}`);
  }
}

run().catch(console.error);
