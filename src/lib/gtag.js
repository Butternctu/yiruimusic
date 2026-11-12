// Google Ads lead-form conversion.
// Global site tag (AW-18349267081) is in index.html.
// Label must match Google Ads → Submit lead form → Event snippet exactly.

const CONVERSION_SEND_TO = 'AW-18349267081/pF4mCLirpdocEImxzq1E';

export function trackConversion() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: CONVERSION_SEND_TO,
  });
}

// Label must match Google Ads → Calculate quote → Event snippet exactly.
// Value is the estimate in dollars, not the snippet's 1.0 placeholder.
const QUOTE_CONVERSION_SEND_TO = 'AW-18349267081/tlUPCLqhvK4dEImxzq1E';

export function trackQuoteCalculated(value) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: QUOTE_CONVERSION_SEND_TO,
    value: Math.round(value),
    currency: 'USD',
  });
}
