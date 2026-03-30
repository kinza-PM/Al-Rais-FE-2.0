export const getEmailError = (raw: string, usePhone: boolean): string | null => {
  const email = raw.trim();
  if (email === '') return 'Email is required.';
  if (!usePhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
};

/** Full name: only letters and spaces allowed (no special characters) */
export const getFullNameError = (raw: string): string | null => {
  const name = raw.trim();
  if (name === '') return 'Name is required.';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Full name cannot contain special characters.';
  return null;
};

/** Phone number: digits only, min length for valid phone */
export const getPhoneError = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return 'Phone number is required.';
  if (digits.length < 8) return 'Please enter a valid phone number.';
  return null;
};

export const getPasswordError = (raw: string): string | null => {
  if (raw.trim() === "") return "Password is required.";

  // Cognito commonly rejects passwords with leading/trailing whitespace.
  if (raw !== raw.trim()) return "Password can't start or end with spaces.";

  // Keep this aligned with the helper text in the Sign Up UI.
  const hasLower = /[a-z]/.test(raw);
  const hasUpper = /[A-Z]/.test(raw);
  const hasNumber = /[0-9]/.test(raw);
  const hasSpecial = /[^A-Za-z0-9]/.test(raw);
  const hasMinLength = raw.length >= 8;
  if (!hasMinLength) return "Password must be at least 8 characters.";
  if (!hasUpper) return "Include at least one uppercase letter.";
  if (!hasLower) return "Include at least one lowercase letter.";
  if (!hasNumber) return "Include at least one number.";
  if (!hasSpecial) return "Include at least one special character.";

  return null;
};

export type PasswordRules = {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  noEdgeWhitespace: boolean;
};

export const evaluatePasswordRules = (raw: string): PasswordRules => {
  return {
    minLength: raw.length >= 8,
    hasUpper: /[A-Z]/.test(raw),
    hasLower: /[a-z]/.test(raw),
    hasNumber: /[0-9]/.test(raw),
    hasSpecial: /[^A-Za-z0-9]/.test(raw),
    noEdgeWhitespace: raw === raw.trim(),
  };
};

export const isPasswordValid = (raw: string): boolean => {
  if (!raw) return false;
  const rules = evaluatePasswordRules(raw);
  return (
    rules.noEdgeWhitespace &&
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial
  );
};
