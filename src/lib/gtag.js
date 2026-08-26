// Google Ads lead-form conversion.
// Global site tag (AW-18349267081) is in index.html.
// send_to must match Google Ads → Goals → Submit lead form → Tag setup exactly.

const CONVERSION_SEND_TO = 'AW-18349267081/pF4mCLirpdoeEImxzqlE';

export function trackConversion({ transactionId } = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: CONVERSION_SEND_TO,
    value: 1.0,
    currency: 'USD',
    transport_type: 'beacon',
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}
