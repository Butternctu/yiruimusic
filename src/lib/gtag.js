// Google Ads lead-form conversion.
// Global site tag (AW-18349267081) is in index.html.
// Label must match Google Ads → Submit lead form → Event snippet exactly.

const CONVERSION_SEND_TO = 'AW-18349267081/pr4mCLirpdocEImxzqlE';

export function trackConversion() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: CONVERSION_SEND_TO,
  });
}
