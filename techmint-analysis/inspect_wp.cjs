const fs = require('fs');

const html = fs.readFileSync('techmint-analysis/steps/step_3.html', 'utf8');

const wpContent = [...html.matchAll(/wp-content\/([a-zA-Z0-9_\-\/]+)/gi)].map(m => m[0]);
console.log('Unique wp paths:');
console.log([...new Set(wpContent)].slice(0, 30));

// Check ad inserter
console.log('\nHas Ad Inserter?', html.includes('ai-viewport') || html.includes('ai_front') || html.includes('code-block'));

// Check plugins
const plugins = [...html.matchAll(/wp-content\/plugins\/([^\/\'\"]+)/gi)].map(m => m[1]);
console.log('Plugins:', [...new Set(plugins)]);
