// Public-facing contact details, shared by the contact section and the footer.
// CONTACT_EMAIL is the address shown on the site and mirrored in the
// LocalBusiness schema in index.html.
// No phone number is published here on purpose: it would be a personal mobile,
// and once scraped it cannot be taken back.
export const CONTACT_EMAIL = 'harpist.yr@outlook.com';
export const CONTACT_WECHAT = 'harpist11';

// Where the inquiry form is delivered. Deliberately different from
// CONTACT_EMAIL, and not shown anywhere on the site. Changing it means the new
// address has to be activated with FormSubmit before anything is delivered.
export const FORM_RECIPIENT_EMAIL = 'liyiyi0411@gmail.com';

// Shown next to the submit button and in the confirmation message. Only promise
// what can actually be kept — an unmet reply window costs more trust than none.
export const RESPONSE_TIME = 'within 24 hours';
