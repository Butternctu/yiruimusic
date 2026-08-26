import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Puts the Google Ads global site tag in the HTML head so Google's tag
// diagnostics can see it without waiting for the React bundle.
function adsTagSnippet(adsId) {
  if (!adsId) return ''

  return `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${adsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${adsId}');
    </script>`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adsId = env.VITE_GOOGLE_ADS_ID?.trim()
  const adsTags = adsTagSnippet(adsId)

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-google-ads-tag',
        transformIndexHtml(html) {
          if (!adsTags) return html
          return html.replace('</head>', `${adsTags}\n  </head>`)
        },
      },
    ],
  }
})
