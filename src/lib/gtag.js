// Google Ads (gtag.js) helper.
// Configured via Vite env vars so no IDs are hard-coded:
//   VITE_GOOGLE_ADS_ID                 e.g. "AW-123456789"
//   VITE_GOOGLE_ADS_CONVERSION_LABEL   label only, or full "AW-.../label"
// Production builds also inject the global site tag into index.html so Google
// Ads diagnostics can detect it. When the ID/label are missing, these are no-ops.

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim();
const CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL?.trim();

let initialized = false;

export function initGoogleAds() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Already injected into index.html during production builds.
  if (typeof window.gtag === 'function') {
    if (ADS_ID) window.gtag('config', ADS_ID);
    return;
  }

  if (!ADS_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ADS_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ADS_ID);
}

// Fire a Google Ads conversion after the contact form is submitted successfully.
export function trackConversion() {
  if (!ADS_ID || !CONVERSION_LABEL) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const sendTo = CONVERSION_LABEL.includes('/')
    ? CONVERSION_LABEL
    : `${ADS_ID}/${CONVERSION_LABEL}`;

  window.gtag('event', 'conversion', {
    send_to: sendTo,
  });
}
