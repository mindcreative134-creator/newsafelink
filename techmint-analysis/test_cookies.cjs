const fs = require('fs');

async function testCookie(cookieName, cookieVal) {
  const res = await fetch('https://techmint.in/readmore/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://techmint.in/fully-funded-scholarships-2026/',
      'Cookie': `${cookieName}=${cookieVal}`
    },
    redirect: 'manual'
  });
  console.log(`Test with ${cookieName}: status ${res.status}, location: ${res.headers.get('location')}`);
  const text = await res.text();
  if (text.includes('studyeducations') || text.includes('educationscholrships')) {
    console.log(`-> SUCCESS! Found redirect:`, text.match(/href\s*=\s*['"]([^'"]+)['"]/)?.[1]);
  }
}

async function run() {
  await testCookie('gt_uc_', 'BMKrQ');
  await testCookie('refBMKrQ', 'test');
  await testCookie('uopusi', 'education, loan, insurance');
}

run();
