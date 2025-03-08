import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16; // AES block size for CBC mode

// Encrypt function
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error('Encryption key is missing');

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const encryptedString = iv.toString('hex') + encrypted;

  return encryptedString;
  // Stores IV with encrypted data
}

// Decrypt function
export function decrypt(encryptedText: string): string {
  if (!ENCRYPTION_KEY) throw new Error('Encryption key is missing');

  const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), 'hex'); // Extract IV
  const encryptedData = encryptedText.slice(IV_LENGTH * 2);

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
