// Google Ads (gtag.js) helper.
// Configured via Vite env vars so no IDs are hard-coded:
//   VITE_GOOGLE_ADS_ID                 e.g. "AW-123456789"
//   VITE_GOOGLE_ADS_CONVERSION_LABEL   e.g. "AbC-D_efG-h12_34-567"
// When these are not set, every function below is a no-op, so the site
// behaves exactly as before in environments without the vars.

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL;

let initialized = false;

export function initGoogleAds() {
  if (initialized || !ADS_ID || typeof window === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ADS_ID);
}

// Fire a Google Ads conversion. Call this the moment a lead is captured
// (e.g. after the contact form is submitted successfully).
export function trackConversion() {
  if (!ADS_ID || !CONVERSION_LABEL) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: `${ADS_ID}/${CONVERSION_LABEL}`,
  });
}
