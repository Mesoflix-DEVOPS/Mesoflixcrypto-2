import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// The ENCRYPTION_KEY must be a 32-byte string stored in Render environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'mesoflix_default_secure_key_32_chars_'; 
const IV_LENGTH = 16; // For AES-256-CBC

/**
 * Encrypt a string using AES-256-CBC
 * @param {string} text 
 * @returns {string} iv:encryptedText
 */
export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt an AES-256-CBC encrypted string
 * @param {string} text 
 * @returns {string} decryptedText
 */
export function decrypt(text) {
  if (!text) return null;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export default {
  encrypt,
  decrypt
};
