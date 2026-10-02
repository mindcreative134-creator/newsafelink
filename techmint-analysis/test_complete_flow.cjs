const fs = require('fs');
const path = require('path');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

class FlowSimulator {
  constructor() {
    this.cookies = {};
    this.step = 0;
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

  async fetch(url, options = {}) {
    this.step++;
    const method = options.method || 'GET';
    const referer = options.referer || '';

    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      ...(options.headers || {})
    };

    const cookieHeader = this.getCookieString();
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (referer) headers['Referer'] = referer;

    console.log(`\n============================================================`);
    console.log(`[STEP ${this.step}] ${method} ${url}`);
    console.log(`REFERER: ${referer || 'none'}`);
    console.log(`COOKIES OUT: ${cookieHeader || 'none'}`);

    const res = await fetch(url, {
      method,
      headers,
      body: options.body,
      redirect: 'manual'
    });

    this.setCookiesFromHeaders(res.headers);
    const location = res.headers.get('location');
    const body = await res.text();

    console.log(`STATUS: ${res.status} ${res.statusText}`);
    if (location) console.log(`LOCATION: ${location}`);
    console.log(`COOKIES NOW:`, this.cookies);

    // Save step output
    const outDir = path.join(__dirname, 'steps_trace');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `trace_${this.step}.html`), body);

    return {
      status: res.status,
      location,
      headers: Object.fromEntries(res.headers.entries()),
      body,
      url
    };
  }
}

async function runSimulation() {
  const sim = new FlowSimulator();

  // 1. Initial shortlink
  const r1 = await sim.fetch('https://arolinks.com/BMKrQ');
  const r1Redirect = r1.body.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i)?.[1];
  console.log('-> arolinks redirects to:', r1Redirect);

  if (!r1Redirect) return;

  // 2. Techmint studyeducations step 1
  const r2 = await sim.fetch(r1Redirect, { referer: 'https://arolinks.com/' });
  const r2Redirect = r2.body.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i)?.[1];
  console.log('-> studyeducations (st=1) redirects to:', r2Redirect);

  if (!r2Redirect) return;

  // 3. First article page
  const r3 = await sim.fetch(r2Redirect, { referer: r1Redirect });
  console.log('-> First article fetched, length:', r3.body.length);

  // In first article, user clicks btn7 (/readmore/)
  // 4. Techmint /readmore/ (Step 1 -> Step 2 transition)
  const r4 = await sim.fetch('https://techmint.in/readmore/', { referer: r2Redirect });
  const r4Redirect = r4.body.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i)?.[1];
  console.log('-> /readmore/ response location:', r4.location || r4Redirect);

  const st2Url = r4.location || r4Redirect;
  if (!st2Url) return;

  // 5. Techmint studyeducations step 2
  const r5 = await sim.fetch(st2Url, { referer: 'https://techmint.in/readmore/' });
  const r5Redirect = r5.body.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i)?.[1];
  console.log('-> studyeducations (st=2) redirects to:', r5Redirect);

  if (!r5Redirect) return;

  // 6. Second article page
  const r6 = await sim.fetch(r5Redirect, { referer: st2Url });
  console.log('-> Second article fetched, length:', r6.body.length);

  // In second article, user clicks btn7 (/readmore/) again!
  // 7. Techmint /readmore/ (Step 2 -> Step 3 transition or destination!)
  const r7 = await sim.fetch('https://techmint.in/readmore/', { referer: r5Redirect });
  const r7Redirect = r7.body.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i)?.[1];
  console.log('-> /readmore/ after step 2 returned location / script:', r7.location || r7Redirect);
  console.log('r7 body:', r7.body.slice(0, 1000));

  const st3Url = r7.location || r7Redirect;
  if (st3Url) {
    // 8. Step 3 or back to arolinks
    const r8 = await sim.fetch(st3Url, { referer: 'https://techmint.in/readmore/' });
    const r8Redirect = r8.body.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i)?.[1];
    console.log('-> Step 3 response location / script:', r8.location || r8Redirect);
    console.log('r8 body snippet:', r8.body.slice(0, 1000));

    const st4Url = r8.location || r8Redirect;
    if (st4Url) {
      const r9 = await sim.fetch(st4Url, { referer: st3Url });
      const r9Redirect = r9.body.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i)?.[1];
      console.log('-> Step 4 response location / script:', r9.location || r9Redirect);
      console.log('r9 body snippet:', r9.body.slice(0, 1000));

      const st5Url = r9.location || r9Redirect;
      if (st5Url) {
        const r10 = await sim.fetch(st5Url, { referer: st4Url });
        console.log('-> Final step response:', r10.location);
        console.log('r10 body snippet:', r10.body.slice(0, 1000));
      }
    }
  }
}

runSimulation().catch(console.error);
