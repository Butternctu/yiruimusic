// Google tag (gtag.js) helper for Google Ads conversions and GA4 behaviour events.
// Configured via Vite env vars so no IDs are hard-coded:
//   VITE_GOOGLE_ADS_ID                 e.g. "AW-123456789"
//   VITE_GOOGLE_ADS_CONVERSION_LABEL   either:
//     - the conversion label only, e.g. "AbC-D_efG-h12_34-567"
//     - or the full send_to value, e.g. "AW-123456789/AbC-D_efG-h12_34-567"
//   VITE_GA4_ID                        e.g. "G-XXXXXXXXXX"
// VITE_FIREBASE_MEASUREMENT_ID is used as a GA4 fallback: a Firebase project with
// Analytics enabled already owns a GA4 property, so the site can report without a
// second property being created.
// When an ID is absent the related functions are no-ops, so environments without
// the vars (local dev, previews) behave exactly as they did before.

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim();
const CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL?.trim();
const GA4_ID = (
  import.meta.env.VITE_GA4_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
)?.trim();

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Production builds inject gtag in index.html so Google Ads can detect the
  // global site tag. Skip duplicate setup when already present.
  if (typeof window.gtag === 'function') return;
  if (!ADS_ID && !GA4_ID) return;

  const script = document.createElement('script');
  script.async = true;
  const scriptId = ADS_ID || GA4_ID;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    scriptId,
  )}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());

  if (GA4_ID) gtag('config', GA4_ID);
  if (ADS_ID) gtag('config', ADS_ID);
}

function getConversionSendTo() {
  if (!ADS_ID || !CONVERSION_LABEL) return null;

  return CONVERSION_LABEL.includes('/')
    ? CONVERSION_LABEL
    : `${ADS_ID}/${CONVERSION_LABEL}`;
}

// Report a behaviour event to GA4. Used to see how far visitors actually get
// before they leave, which the Ads conversion alone cannot show.
export function trackEvent(name, params = {}) {
  if (!GA4_ID) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', name, params);
}

// Fire a Google Ads conversion. Call this the moment a lead is captured
// (e.g. after the contact form is submitted successfully).
export function trackConversion({ transactionId } = {}) {
  const sendTo = getConversionSendTo();
  if (!sendTo) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    value: 1.0,
    currency: 'USD',
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}
