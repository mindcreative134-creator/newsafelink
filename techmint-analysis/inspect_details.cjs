const fs = require('fs');

const html = fs.readFileSync('techmint-analysis/steps/step_3.html', 'utf8');

console.log('=== EXTERNAL SCRIPTS ===');
const extScripts = [...html.matchAll(/<script[^>]*src=['"]([^'"]+)['"][^>]*>/gi)].map(m => m[1]);
extScripts.forEach(s => console.log(' -', s));

console.log('\n=== INLINE SCRIPTS SEARCH FOR sendAdData ===');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
scripts.forEach((s, i) => {
  if (s.includes('sendAdData')) {
    console.log(`Script ${i} contains sendAdData`);
  }
});

console.log('\n=== ALL FORMS & INPUTS ===');
const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)].map(m => m[0]);
forms.forEach((f, i) => console.log(`Form ${i+1}:\n`, f.slice(0, 300)));

console.log('\n=== ALL INPUTS (TYPE=HIDDEN) ===');
const hiddenInputs = [...html.matchAll(/<input[^>]*type=['"]hidden['"][^>]*>/gi)].map(m => m[0]);
hiddenInputs.forEach(h => console.log(' -', h));
