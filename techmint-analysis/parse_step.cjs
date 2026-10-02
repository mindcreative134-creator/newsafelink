const fs = require('fs');

const files = ['step_1.html', 'step_2.html', 'step_3.html', 'step_4.html', 'step_5.html', 'step_6.html', 'step_7.html', 'step_8.html'];

for (const file of files) {
  const p = `techmint-analysis/steps/${file}`;
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, 'utf8');
  console.log(`\n=================== FILE: ${file} (${html.length} bytes) ===================`);

  // Title
  const title = html.match(/<title>([^<]*)<\/title>/i);
  console.log('Title:', title ? title[1].trim() : 'N/A');

  // Scripts with redirect or location
  const scriptRedirects = [...html.matchAll(/(?:window|document)\.location(?:|\.href)\s*=\s*['"]([^'"]+)['"]/gi)];
  if (scriptRedirects.length) {
    console.log('Script redirects:', scriptRedirects.map(m => m[1]));
  }

  // Buttons
  const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
  if (buttons.length) {
    console.log('Buttons:', buttons.map(b => b[0].trim().replace(/\s+/g, ' ').slice(0, 100)));
  }

  // Links with readmore or btn7 or studyeducations
  const links = [...html.matchAll(/<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi)];
  const relevantLinks = links.filter(l => l[1].includes('readmore') || l[1].includes('studyeducations') || l[0].includes('btn7') || l[2].includes('Continue'));
  if (relevantLinks.length) {
    console.log('Relevant Links:', relevantLinks.map(l => l[0].trim().replace(/\s+/g, ' ')));
  }
}
