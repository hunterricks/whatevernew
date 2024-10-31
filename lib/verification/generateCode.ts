import { randomBytes } from 'crypto';

export function generateVerificationCode(length: number = 6): string {
  const bytes = randomBytes(Math.ceil(length / 2));
  const code = parseInt(bytes.toString('hex'), 16).toString().slice(0, length);
  return code.padStart(length, '0');
}

export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateExpiryDate(minutes: number = 30): Date {
  return new Date(Date.now() + minutes * 60000);
}