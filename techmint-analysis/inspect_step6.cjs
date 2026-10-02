const fs = require('fs');

async function inspectStep6Article() {
  const cookieStr = 'PHPSESSID=a751d3cf7e7bb994cfc9aa63659ee486; uopusi=education%252C%2520loan%252C%2520insurance%252C%2520jobvacancy; iotes=education%252C%2520loan%252C%2520insurance%252C%2520jobvacancy; eonstudb=deleted';
  const res = await fetch('https://techmint.in/fully-funded-scholarships-2026/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://techmint.in/studyeducations/?educationsscholorships=BMKrQ&pgtr=10&st=2',
      'Cookie': cookieStr
    }
  });

  const text = await res.text();
  console.log('Step 6 length:', text.length);

  // Check btn7 or any link
  const links = [...text.matchAll(/<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('All links containing readmore or Continue:');
  links.filter(l => l[1].includes('readmore') || l[2].includes('Continue') || l[0].includes('btn')).forEach(l => {
    console.log(l[0].replace(/\s+/g, ' '));
  });

  // Check buttons
  const btns = [...text.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
  console.log('Buttons:', btns.map(b => b[0].trim().replace(/\s+/g, ' ')));

  // Check countdown or timer
  const scripts = [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  scripts.forEach((s, idx) => {
    if (s.includes('timer') || s.includes('btn6') || s.includes('btn7') || s.includes('countdown')) {
      console.log(`\nScript ${idx}:`, s.slice(0, 500));
    }
  });
}

inspectStep6Article().catch(console.error);
