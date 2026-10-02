const fs = require('fs');

async function testOnlineWishReadMore() {
  const cookieStr = 'PHPSESSID=8b6a083f2bb7c7931a261eb0cc3a6a8a; uopusi=education%252C%2520loan%252C%2520insurance%252C%2520jobvacancy';

  const res = await fetch('https://onlinewish.in/readmore/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://onlinewish.in/online-ai-certification-courses-usa/',
      'Cookie': cookieStr
    },
    redirect: 'manual'
  });

  console.log('Status:', res.status, res.statusText);
  console.log('Location:', res.headers.get('location'));
  const text = await res.text();
  console.log('Body:', text);
}

testOnlineWishReadMore().catch(console.error);
