import { Injectable } from '@nestjs/common';
import type { PublicUser } from '../auth/auth.types';
import { USERS, UserRecord, verifyPassword } from './users.data';

/** Profile projection returned by GET /users/me. Sensitive fields are masked. */
export interface UserProfile extends PublicUser {
  phone: string;
  tier: string;
  memberSince: string;
  /** e.g. "******6789" - the full number is never sent to the client. */
  accountNumberMasked: string;
  bvnMasked: string;
}

@Injectable()
export class UsersService {
  findById(id: string): UserRecord | undefined {
    return USERS.find((user) => user.id === id);
  }

  /** Looks a user up by email (case-insensitive) or phone number. */
  findByIdentifier(identifier: string): UserRecord | undefined {
    const normalised = identifier.trim().toLowerCase();
    const digits = identifier.replace(/\D/g, '');
    return USERS.find(
      (user) => user.email.toLowerCase() === normalised || (digits && user.phone === digits),
    );
  }

  validateCredentials(identifier: string, password: string): UserRecord | null {
    const user = this.findByIdentifier(identifier);
    if (!user) return null;
    return verifyPassword(password, user.passwordHash) ? user : null;
  }

  toPublicUser(user: UserRecord): PublicUser {
    return { id: user.id, name: user.name, email: user.email };
  }

  toProfile(user: UserRecord): UserProfile {
    return {
      ...this.toPublicUser(user),
      phone: maskPhone(user.phone),
      tier: user.tier,
      memberSince: user.memberSince,
      accountNumberMasked: maskTail(user.accountNumber, 4),
      bvnMasked: maskTail(user.bvn, 3),
    };
  }
}

function maskTail(value: string, visible: number): string {
  return '*'.repeat(Math.max(value.length - visible, 0)) + value.slice(-visible);
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}
