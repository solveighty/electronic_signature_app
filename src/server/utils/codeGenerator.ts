/**
 * Generates a random 6-digit verification code
 * @returns {string} A 6-digit numeric code as a string
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
