// Google Ads conversion helper.
// The global site tag (AW-18349267081) lives in index.html.
// This file only fires the lead-form conversion after a successful submit.
//   VITE_GOOGLE_ADS_ID                 e.g. "AW-123456789"
//   VITE_GOOGLE_ADS_CONVERSION_LABEL   e.g. "AbC-D_efG-h12_34-567"

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL;

export function trackConversion() {
  if (!ADS_ID || !CONVERSION_LABEL) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: `${ADS_ID}/${CONVERSION_LABEL}`,
  });
}
