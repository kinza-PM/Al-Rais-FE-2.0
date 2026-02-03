export const getEmailError = (
  raw: string,
  usePhone: boolean,
): string | null => {
  const email = raw.trim();
  if (email === "") return "Email is required.";
  if (!usePhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a valid email address.";
  return null;
};

export const getPasswordError = (raw: string): string | null => {
  if (raw.trim() === "") return "Password is required.";

  // Cognito commonly rejects passwords with leading/trailing whitespace.
  if (raw !== raw.trim()) return "Password can’t start or end with spaces.";

  // Keep this aligned with the helper text in the Sign Up UI.
  const hasLower = /[a-z]/.test(raw);
  const hasUpper = /[A-Z]/.test(raw);
  const hasNumber = /[0-9]/.test(raw);
  const hasSpecial = /[^A-Za-z0-9]/.test(raw);
  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    return "Password must follow the security rules.";
  }

  return null;
};
