export interface FreeTrialCountry {
  code: string;
  name: string;
  dial: string;
  pattern: RegExp;
}

const DEFAULT_PATTERN = /^[1-9]\d{5,13}$/;

export const FREE_TRIAL_COUNTRIES: readonly FreeTrialCountry[] = [
  { code: "BE", name: "Belgium", dial: "+32", pattern: /^[1-9]\d{7,8}$/ },
  { code: "NL", name: "Netherlands", dial: "+31", pattern: /^[1-9]\d{8,9}$/ },
  { code: "FR", name: "France", dial: "+33", pattern: /^[1-9]\d{8}$/ },
  { code: "DE", name: "Germany", dial: "+49", pattern: /^[1-9]\d{6,11}$/ },
  { code: "GB", name: "United Kingdom", dial: "+44", pattern: /^[1-9]\d{9}$/ },
  { code: "ES", name: "Spain", dial: "+34", pattern: /^[1-9]\d{8}$/ },
  { code: "IT", name: "Italy", dial: "+39", pattern: /^3\d{8,10}$/ },
  { code: "PT", name: "Portugal", dial: "+351", pattern: /^[29]\d{8}$/ },
  { code: "LU", name: "Luxembourg", dial: "+352", pattern: /^[269]\d{3,7}$/ },
  { code: "CH", name: "Switzerland", dial: "+41", pattern: /^[1-9]\d{8}$/ },
  { code: "AT", name: "Austria", dial: "+43", pattern: /^[1-9]\d{4,12}$/ },
  { code: "SE", name: "Sweden", dial: "+46", pattern: /^[1-9]\d{6,9}$/ },
  { code: "NO", name: "Norway", dial: "+47", pattern: /^[1-9]\d{7}$/ },
  { code: "DK", name: "Denmark", dial: "+45", pattern: /^[1-9]\d{7}$/ },
  { code: "PL", name: "Poland", dial: "+48", pattern: /^[1-9]\d{8}$/ },
  { code: "RO", name: "Romania", dial: "+40", pattern: /^[1-9]\d{8}$/ },
  { code: "GR", name: "Greece", dial: "+30", pattern: /^[1-9]\d{9}$/ },
  { code: "IE", name: "Ireland", dial: "+353", pattern: /^[1-9]\d{7,8}$/ },
  { code: "MA", name: "Morocco", dial: "+212", pattern: /^[67]\d{8}$/ },
  { code: "DZ", name: "Algeria", dial: "+213", pattern: /^[5-7]\d{8}$/ },
  { code: "TN", name: "Tunisia", dial: "+216", pattern: /^[2459]\d{7}$/ },
  { code: "TR", name: "Turkey", dial: "+90", pattern: /^5\d{9}$/ },
  { code: "AE", name: "United Arab Emirates", dial: "+971", pattern: /^5\d{8}$/ },
  { code: "SA", name: "Saudi Arabia", dial: "+966", pattern: /^5\d{8}$/ },
  { code: "US", name: "United States", dial: "+1", pattern: /^\d{10}$/ },
  { code: "CA", name: "Canada", dial: "+1", pattern: /^\d{10}$/ },
  { code: "AU", name: "Australia", dial: "+61", pattern: /^\d{9}$/ },
];

export const FREE_TRIAL_DEFAULT_COUNTRY = "BE";

export function findFreeTrialCountry(code: string): FreeTrialCountry {
  return (
    FREE_TRIAL_COUNTRIES.find((country) => country.code === code) ??
    FREE_TRIAL_COUNTRIES[0]
  );
}

export function normalizeWhatsAppNumber(value: string, dial: string): string {
  const digits = value.replace(/\D/g, "");
  const dialDigits = dial.replace(/\D/g, "");
  if (dialDigits && digits.startsWith(dialDigits)) {
    return digits.slice(dialDigits.length);
  }
  return digits;
}

export interface FreeTrialInput {
  firstName: string;
  lastName: string;
  email: string;
  whatsappCountry: string;
  whatsappNumber: string;
}

export interface FreeTrialFieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  whatsappNumber?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFreeTrialInput(
  input: FreeTrialInput,
): FreeTrialFieldErrors {
  const errors: FreeTrialFieldErrors = {};

  if (input.firstName.trim().length < 2) {
    errors.firstName = "Please enter your first name.";
  }
  if (input.lastName.trim().length < 2) {
    errors.lastName = "Please enter your last name.";
  }
  if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  const country = findFreeTrialCountry(input.whatsappCountry);
  const national = normalizeWhatsAppNumber(input.whatsappNumber, country.dial);

  if (!national) {
    errors.whatsappNumber = "Please enter your WhatsApp number.";
  } else if (
    !(
      country.pattern.test(national) ||
      (country.pattern !== DEFAULT_PATTERN && DEFAULT_PATTERN.test(national))
    )
  ) {
    errors.whatsappNumber =
      "This number doesn't look right for the selected country.";
  }

  return errors;
}
