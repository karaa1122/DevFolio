import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly enabled: boolean;

  constructor(cfg: ConfigService) {
    const hex = cfg.get<string>('encryption.key') ?? '';
    this.enabled = hex.length === 64;
    this.key = this.enabled ? Buffer.from(hex, 'hex') : Buffer.alloc(32);
  }

  encrypt(plaintext: string): string {
    if (!this.enabled || !plaintext) return plaintext;
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${body.toString('hex')}`;
  }

  decrypt(ciphertext: string): string {
    if (!ciphertext || !ciphertext.startsWith('enc:')) return ciphertext;
    const parts = ciphertext.split(':');
    if (parts.length !== 4) return ciphertext;
    const [, ivHex, tagHex, bodyHex] = parts;
    const decipher = createDecipheriv(ALGO, this.key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(bodyHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }
}
