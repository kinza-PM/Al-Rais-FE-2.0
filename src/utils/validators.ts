export const getEmailError = (raw: string, usePhone: boolean): string | null => {
    const email = raw.trim();
    if (email === '') return 'This field is required.';
    if (!usePhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email is not valid.';
    return null;
};