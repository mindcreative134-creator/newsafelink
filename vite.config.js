import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to inline CSS directly into index.html to eliminate the render-blocking stylesheet network request
let cssContent = '';

const inlineCSS = () => ({
  name: 'inline-css',
  generateBundle(options, bundle) {
    // Extract CSS contents and delete the asset from the bundle so it is not written to disk
    cssContent = '';
    for (const key of Object.keys(bundle)) {
      if (key.endsWith('.css')) {
        cssContent += bundle[key].source;
        delete bundle[key];
      }
    }
  },
  transformIndexHtml(html, ctx) {
    // Remove the CSS link tags injected by Vite
    let cleanedHtml = html.replace(/<link rel="stylesheet"[^>]*href="[^"]+\.css"[^>]*>/gi, '');
    // Inject the inline style tag before </head>
    if (cssContent) {
      cleanedHtml = cleanedHtml.replace('</head>', `<style>${cssContent}</style></head>`);
    }
    return cleanedHtml;
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), inlineCSS()],
})
