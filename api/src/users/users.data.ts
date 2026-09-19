import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Internal user record. Only `PublicUser` / `UserProfile` projections ever
 * leave the API; sensitive identifiers (BVN, account number) are stored here
 * to demonstrate masking, and would live in an encrypted store in production.
 */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  roles: string[];
  tier: 'Standard' | 'Premium';
  memberSince: string;
  bvn: string;
  accountNumber: string;
}

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(key, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Demo credentials (documented in the README): demo@veridian.app / Password123! */
export const DEMO_PASSWORD = 'Password123!';

export const USERS: UserRecord[] = [
  {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08012345678',
    passwordHash: hashPassword(DEMO_PASSWORD),
    roles: ['customer'],
    tier: 'Premium',
    memberSince: '2022-03-14',
    bvn: '22345678901',
    accountNumber: '0123456789',
  },
  {
    id: '124',
    name: 'Amaka Obi',
    email: 'demo@veridian.app',
    phone: '08098765432',
    passwordHash: hashPassword(DEMO_PASSWORD),
    roles: ['customer'],
    tier: 'Standard',
    memberSince: '2024-01-09',
    bvn: '22398765432',
    accountNumber: '0987654321',
  },
];
