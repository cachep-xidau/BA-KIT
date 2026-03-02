import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateEncryptionKey } from '../services/crypto.js';

describe('Crypto Service', () => {
    const testKey = generateEncryptionKey();

    it('generateKey produces 64-char hex string', () => {
        const key = generateEncryptionKey();
        expect(key).toHaveLength(64);
        expect(/^[0-9a-f]+$/.test(key)).toBe(true);
    });

    it('encrypts and decrypts correctly', () => {
        const plaintext = 'super-secret-api-key-12345';
        const encrypted = encrypt(plaintext, testKey);

        expect(encrypted).not.toBe(plaintext);
        expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/); // valid base64

        const decrypted = decrypt(encrypted, testKey);
        expect(decrypted).toBe(plaintext);
    });

    it('produces different ciphertexts for same input (random IV)', () => {
        const plaintext = 'same-input';
        const a = encrypt(plaintext, testKey);
        const b = encrypt(plaintext, testKey);

        expect(a).not.toBe(b); // Different IVs
        expect(decrypt(a, testKey)).toBe(plaintext);
        expect(decrypt(b, testKey)).toBe(plaintext);
    });

    it('decryption fails with wrong key', () => {
        const encrypted = encrypt('secret', testKey);
        const wrongKey = generateEncryptionKey();

        expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it('handles empty string', () => {
        const encrypted = encrypt('', testKey);
        expect(decrypt(encrypted, testKey)).toBe('');
    });

    it('handles unicode content', () => {
        const unicodeText = '日本語テスト 🎨 привет мир';
        const encrypted = encrypt(unicodeText, testKey);
        expect(decrypt(encrypted, testKey)).toBe(unicodeText);
    });

    it('handles large payloads', () => {
        const large = 'A'.repeat(100_000);
        const encrypted = encrypt(large, testKey);
        expect(decrypt(encrypted, testKey)).toBe(large);
    });
});
