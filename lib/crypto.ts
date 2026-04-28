/**
 * Position Number Encryption Utility
 * 
 * Uses AES-256-GCM symmetric encryption to encrypt position numbers
 * before storing in the database. This ensures position numbers are
 * not visible as plain text in the DB.
 * 
 * Algorithm: AES-256-GCM (Authenticated Encryption)
 * Key: 32-byte hex string from POSITION_ENCRYPTION_KEY env var
 * IV: Random 12-byte value generated per encryption (prepended to ciphertext)
 * Output format: base64( IV[12] + Ciphertext + AuthTag[16] )
 * 
 * Why AES-256-GCM?
 * - Symmetric: same key encrypts & decrypts (fast, no key exchange needed)
 * - GCM mode: provides both confidentiality AND integrity (tamper-proof)
 * - Random IV: same position_number encrypts to different ciphertext each time
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits — recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get the encryption key from environment variables.
 * Must be a 64-character hex string (32 bytes).
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.POSITION_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      'POSITION_ENCRYPTION_KEY is not set in environment variables. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  if (keyHex.length !== 64) {
    throw new Error(
      'POSITION_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      `Current length: ${keyHex.length}`
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a position number.
 * 
 * @param positionNumber - The plain position number (e.g. 1, 2, 3...)
 * @returns Encrypted string in base64 format
 * 
 * @example
 * encryptPosition(5)  // => "dG9rZW4xMjM0NTY3ODk..." (opaque base64 string)
 */
export function encryptPosition(positionNumber: number): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  // Convert number to string for encryption
  const plaintext = positionNumber.toString();
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine: IV + Ciphertext + AuthTag → base64
  const combined = Buffer.concat([iv, encrypted, authTag]);
  return combined.toString('base64');
}

/**
 * Decrypt an encrypted position number back to its original value.
 * 
 * @param encryptedValue - The base64 encrypted string from the database
 * @returns The original position number
 * 
 * @example
 * decryptPosition("dG9rZW4xMjM0NTY3ODk...")  // => 5
 */
export function decryptPosition(encryptedValue: string): number {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedValue, 'base64');
  
  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  
  return parseInt(decrypted.toString('utf8'), 10);
}

/**
 * Batch encrypt multiple position numbers.
 * Useful when creating contest positions.
 */
export function encryptPositions(positionNumbers: number[]): string[] {
  return positionNumbers.map(encryptPosition);
}

/**
 * Batch decrypt multiple encrypted position values.
 * Useful when reading contest positions from DB.
 */
export function decryptPositions(encryptedValues: string[]): number[] {
  return encryptedValues.map(decryptPosition);
}
