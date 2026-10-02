const fs = require('fs');

async function testFullSequence() {
  const domainJars = {};

  function updateCookies(url, res) {
    const domain = new URL(url).hostname;
    if (!domainJars[domain]) domainJars[domain] = {};

    let sc = null;
    if (typeof res.headers.getSetCookie === 'function') {
      sc = res.headers.getSetCookie();
    } else if (res.headers.get('set-cookie')) {
      sc = [res.headers.get('set-cookie')];
    }
    if (sc) {
      for (const s of sc) {
        const [pair] = s.split(';');
        const [k, v] = pair.split('=');
        domainJars[domain][k.trim()] = v ? v.trim() : '';
        console.log(`  [COOKIE for ${domain}] ${k.trim()} = ${v ? v.trim().slice(0, 30) : ''}...`);
      }
    }
  }

  function getCookieHeader(url) {
    const domain = new URL(url).hostname;
    const jar = domainJars[domain] || {};
    return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async function stepGet(url, referer = '') {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
    };
    const c = getCookieHeader(url);
    if (c) headers['Cookie'] = c;
    if (referer) headers['Referer'] = referer;

    console.log(`\n--> GET ${url}`);
    console.log(`    Referer: ${referer || 'none'}`);
    console.log(`    Cookies sent: ${c || 'none'}`);

    const res = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'manual'
    });

    console.log(`    Status: ${res.status} ${res.statusText}`);
    updateCookies(url, res);
    const location = res.headers.get('location');
    if (location) console.log(`    Location header: ${location}`);
    const text = await res.text();

    return {
      status: res.status,
      location,
      text,
      url
    };
  }

  function extractNext(res) {
    if (res.location) {
      if (res.location.startsWith('/')) {
        const u = new URL(res.url);
        return `${u.origin}${res.location}`;
      }
      return res.location;
    }
    const jsMatch = res.text.match(/(?:window|document)\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i);
    if (jsMatch) return jsMatch[1];

    const btn7Match = res.text.match(/<a[^>]*id=['"]btn7['"][^>]*href=['"]([^'"]+)['"]/i);
    if (btn7Match) {
      let href = btn7Match[1];
      if (href.startsWith('/')) {
        const u = new URL(res.url);
        href = `${u.origin}${href}`;
      }
      return href;
    }

    return null;
  }

  // 1. Initial link
  let currentUrl = 'https://arolinks.com/BMKrQ';
  let referer = '';

  for (let step = 1; step <= 20; step++) {
    console.log(`\n=================== STEP ${step} ===================`);
    const res = await stepGet(currentUrl, referer);

    let next = extractNext(res);
    console.log(`Extracted next: ${next}`);

    if (!next) {
      console.log(`No next URL in step ${step}. Inspecting text:`);
      console.log(res.text.slice(0, 500));
      break;
    }

    // If next is /readmore without trailing slash, make sure we format it
    if (next.endsWith('/readmore')) {
      next = next + '/';
    }

    referer = currentUrl;
    currentUrl = next;
  }
}

testFullSequence().catch(console.error);
