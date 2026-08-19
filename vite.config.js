import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function googleTagSnippet(adsId, ga4Id) {
  if (!adsId && !ga4Id) return ''

  const scriptId = adsId || ga4Id
  const configs = []
  if (ga4Id) configs.push(`gtag('config', '${ga4Id}');`)
  if (adsId) configs.push(`gtag('config', '${adsId}');`)

  return `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${scriptId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      ${configs.join('\n      ')}
    </script>`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adsId = env.VITE_GOOGLE_ADS_ID?.trim()
  const ga4Id = (env.VITE_GA4_ID || env.VITE_FIREBASE_MEASUREMENT_ID)?.trim()
  const googleTags = googleTagSnippet(adsId, ga4Id)

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-google-tags',
        transformIndexHtml(html) {
          if (!googleTags) return html
          return html.replace('</head>', `${googleTags}\n  </head>`)
        },
      },
    ],
  }
})
