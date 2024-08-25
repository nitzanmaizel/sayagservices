import crypto from 'crypto';
import path from 'path';

/**
 * Sanitizes a user ID by creating a hashed representation suitable for use in file names.
 *
 * @param tokenPath - The base directory where the tokens are stored.
 * @param userId - The unique Google User ID (or any unique identifier for the user).
 * @returns The sanitized file path where the user's tokens should be stored.
 */
const getTokenPath = (tokenPath: string, userId: string): string => {
  // Hash the user ID to create a safe, fixed-length file name
  const sanitizedUserId = crypto.createHash('sha256').update(userId).digest('hex');
  return path.join(tokenPath, `${sanitizedUserId}.json`);
};

export default getTokenPath;
