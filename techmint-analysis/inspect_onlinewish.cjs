const fs = require('fs');

async function inspectOnlineWishArticle() {
  // Step A: Visit educationscholrships
  const r1 = await fetch('https://onlinewish.in/educationscholrships/?universitiestudyie=BMKrQ', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://techmint.in/readmore/'
    }
  });

  let cookies = [];
  if (typeof r1.headers.getSetCookie === 'function') {
    cookies = r1.headers.getSetCookie();
  } else if (r1.headers.get('set-cookie')) {
    cookies = [r1.headers.get('set-cookie')];
  }
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('OnlineWish Step 1 cookies:', cookieStr);

  const t1 = await r1.text();
  const nextArticle = t1.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/)?.[1];
  console.log('OnlineWish article URL:', nextArticle);

  if (!nextArticle) return;

  // Step B: Fetch the article
  const r2 = await fetch(nextArticle, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://onlinewish.in/educationscholrships/?universitiestudyie=BMKrQ',
      'Cookie': cookieStr
    }
  });

  const t2 = await r2.text();
  console.log('Article length:', t2.length);

  // Find all scripts
  const scripts = [...t2.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  console.log('Total scripts found:', scripts.length);
  scripts.forEach((s, idx) => {
    if (s.includes('timer') || s.includes('btn') || s.includes('count') || s.includes('wait') || s.includes('verify') || s.includes('continue') || s.includes('location') || s.includes('arolinks')) {
      console.log(`\n--- Script ${idx} ---`);
      console.log(s.slice(0, 500));
    }
  });

  // Find all buttons
  const btns = [...t2.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[0].replace(/\s+/g, ' '));
  console.log('Buttons:', btns);

  // Find all links
  const links = [...t2.matchAll(/<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[0].replace(/\s+/g, ' '));
  const filteredLinks = links.filter(l => l.includes('readmore') || l.includes('btn') || l.includes('arolinks') || l.includes('Continue'));
  console.log('Filtered links:', filteredLinks);
}

inspectOnlineWishArticle().catch(console.error);
