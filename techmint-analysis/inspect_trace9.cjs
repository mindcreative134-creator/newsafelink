const fs = require('fs');

const html = fs.readFileSync('techmint-analysis/steps_trace/trace_9.html', 'utf8');

const links = [...html.matchAll(/<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi)];
const relevantLinks = links.filter(l => l[1].includes('readmore') || l[1].includes('study') || l[1].includes('arolinks') || l[0].includes('btn7') || l[2].includes('Continue'));
console.log('Relevant links in trace 9:');
relevantLinks.forEach(l => console.log(l[0].replace(/\s+/g, ' ')));

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
scripts.forEach((s, idx) => {
  if (s.includes('timer') || s.includes('btn6') || s.includes('btn7') || s.includes('countdown') || s.includes('arolinks')) {
    console.log(`\n--- Script ${idx} in onlinewish: ---`);
    console.log(s.slice(0, 800));
  }
});
