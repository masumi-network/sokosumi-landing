/* Lead-form rules shared by the browser and the API routes. The server
   repeats every check (plus disposable, MX and DNS lookups) in leadGuard.ts;
   the browser only checks what it can without a network round trip. */

export type LeadField = "email" | "url" | "name" | "org" | "form";

export type LeadErrorCode =
  | "required"
  | "email_invalid"
  | "email_freemail"
  | "email_disposable"
  | "email_domain"
  | "url_invalid"
  | "url_unreachable"
  | "rate_limited"
  | "rejected";

export type LeadCheck =
  | { ok: true }
  | { ok: false; field: LeadField; code: LeadErrorCode };

const FREEMAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "gmx.de",
  "gmx.net",
  "gmx.at",
  "gmx.ch",
  "gmx.com",
  "gmx.eu",
  "web.de",
  "t-online.de",
  "outlook.com",
  "outlook.de",
  "hotmail.com",
  "hotmail.de",
  "live.com",
  "live.de",
  "msn.com",
  "yahoo.com",
  "yahoo.de",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "aol.de",
  "freenet.de",
  "arcor.de",
  "online.de",
  "email.de",
  "mail.de",
  "mail.com",
  "posteo.de",
  "posteo.net",
  "mailbox.org",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "tutanota.com",
  "tuta.io",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "bluewin.ch",
]);

const EMAIL_RE = /^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,}$/i;
const HOST_RE = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function isEmailFormat(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isFreemail(email: string): boolean {
  return FREEMAIL.has(emailDomain(email));
}

/** "firma.de", "www.firma.de/x" or "https://firma.de" -> "https://firma.de/…".
 *  Returns null when there is no plausible domain in it ("kein link"). */
export function normalizeWebsite(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return HOST_RE.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Checks the browser can run before submitting. */
export function checkEmail(email: string, rejectFreemail: boolean): LeadCheck {
  if (!email.trim()) return { ok: false, field: "email", code: "required" };
  if (!isEmailFormat(email)) return { ok: false, field: "email", code: "email_invalid" };
  if (rejectFreemail && isFreemail(email))
    return { ok: false, field: "email", code: "email_freemail" };
  return { ok: true };
}

export function checkWebsite(url: string): LeadCheck {
  if (!url.trim()) return { ok: false, field: "url", code: "required" };
  if (!normalizeWebsite(url)) return { ok: false, field: "url", code: "url_invalid" };
  return { ok: true };
}

const MESSAGES: Record<LeadErrorCode, { de: string; en: string }> = {
  required: {
    de: "Bitte füllen Sie dieses Feld aus.",
    en: "Please fill in this field.",
  },
  email_invalid: {
    de: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    en: "Please enter a valid email address.",
  },
  email_freemail: {
    de: "Bitte nutzen Sie Ihre geschäftliche E-Mail-Adresse.",
    en: "Please use your business email address.",
  },
  email_disposable: {
    de: "Wegwerf-Adressen können wir nicht annehmen. Bitte nutzen Sie Ihre geschäftliche E-Mail-Adresse.",
    en: "We can't accept disposable addresses. Please use your business email address.",
  },
  email_domain: {
    de: "An diese Domain können keine E-Mails zugestellt werden. Bitte prüfen Sie die Adresse.",
    en: "This domain can't receive email. Please check the address.",
  },
  url_invalid: {
    de: "Bitte geben Sie eine Website-Adresse ein, z. B. ihr-unternehmen.de.",
    en: "Please enter a website address, e.g. your-company.com.",
  },
  url_unreachable: {
    de: "Diese Domain finden wir nicht. Bitte prüfen Sie die Adresse.",
    en: "We can't find this domain. Please check the address.",
  },
  rate_limited: {
    de: "Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in ein paar Minuten noch einmal.",
    en: "Too many requests in a short time. Please try again in a few minutes.",
  },
  rejected: {
    de: "Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal.",
    en: "That didn't go through. Please try again.",
  },
};

export function leadMessage(code: LeadErrorCode, locale: "de" | "en"): string {
  return MESSAGES[code][locale];
}

export const FREEMAIL_WARNING = {
  de: "Mit Ihrer geschäftlichen E-Mail-Adresse können wir den Termin besser vorbereiten.",
  en: "With your business email address we can prepare the call better.",
};

export const PRIVACY_NOTE = {
  de: { before: "Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer", link: "Datenschutzerklärung", after: "." },
  en: { before: "For how we process your data, see our", link: "privacy policy", after: "." },
};

export const PRIVACY_URL = "https://www.sokosumi.com/privacy-policy";

/** Name of the hidden honeypot field. Humans never see or fill it. */
export const HONEYPOT_FIELD = "company_fax";
