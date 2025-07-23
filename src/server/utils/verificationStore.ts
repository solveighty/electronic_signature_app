interface VerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
  name: string;
}

// In-memory store for verification codes
// In production, use Redis or similar persistent storage
const verificationCodes = new Map<string, VerificationCode>();

/**
 * Stores a verification code for an email
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @param name - User's name
 */
export const storeVerificationCode = (
  email: string,
  code: string,
  name: string
): void => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire in 10 minutes

  verificationCodes.set(email, {
    email,
    code,
    expiresAt,
    name,
  });
};

/**
 * Retrieves and validates a verification code
 * @param email - User's email address
 * @param code - 6-digit verification code to verify
 * @returns boolean indicating if the code is valid
 */
export const verifyCode = (email: string, code: string): boolean => {
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return false;
  }

  // Ensure expiresAt is a Date object
  const expiresAt =
    storedData.expiresAt instanceof Date
      ? storedData.expiresAt
      : new Date(storedData.expiresAt);

  // Check if code has expired
  if (new Date() > expiresAt) {
    verificationCodes.delete(email);
    return false;
  }

  // Check if code matches
  if (Number(storedData.code) !== Number(code)) {
    return false;
  }

  // Code is valid, remove it from storage
  verificationCodes.delete(email);
  return true;
};

/**
 * Removes a verification code from storage
 * @param email - User's email address
 */
export const removeVerificationCode = (email: string): void => {
  verificationCodes.delete(email);
};

/**
 * Gets user data associated with a verification code
 * @param email - User's email address
 * @returns User data if verification code exists and is valid
 */
export const getVerificationData = (email: string): VerificationCode | null => {
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return null;
  }

  // Ensure expiresAt is a Date object
  const expiresAt =
    storedData.expiresAt instanceof Date
      ? storedData.expiresAt
      : new Date(storedData.expiresAt);

  // Check if code has expired
  if (new Date() > expiresAt) {
    verificationCodes.delete(email);
    return null;
  }

  return storedData;
};

export type { VerificationCode };
