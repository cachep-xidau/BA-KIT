import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const MIN_CIPHERTEXT_LENGTH = IV_LENGTH + TAG_LENGTH + 1; // at least 1 byte of encrypted data

/**
 * Encrypt a string using AES-256-GCM.
 * Returns base64-encoded ciphertext (iv + tag + encrypted).
 */
export function encrypt(plaintext: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error('Encryption key must be 32 bytes (64 hex chars)');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    // iv (16) + tag (16) + encrypted
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
export function decrypt(ciphertext: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error('Encryption key must be 32 bytes (64 hex chars)');
    }

    // Validate ciphertext format
    if (!ciphertext || typeof ciphertext !== 'string') {
        throw new Error('Invalid ciphertext: must be a non-empty string');
    }

    const data = Buffer.from(ciphertext, 'base64');

    // Check minimum length
    if (data.length < MIN_CIPHERTEXT_LENGTH) {
        throw new Error('Invalid ciphertext: insufficient length (must be at least 33 bytes)');
    }

    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

    // Validate tag length
    if (tag.length !== TAG_LENGTH) {
        throw new Error('Invalid ciphertext: authentication tag must be 16 bytes');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(tag);

    try {
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch {
        throw new Error('Decryption failed: invalid key or corrupted ciphertext');
    }
}

/**
 * Generate a random 32-byte encryption key (hex encoded).
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
