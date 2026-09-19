import type { PublicUser } from './auth';

/** GET /users/me - sensitive identifiers arrive already masked by the API. */
export interface UserProfile extends PublicUser {
  phone: string;
  tier: string;
  memberSince: string;
  accountNumberMasked: string;
  bvnMasked: string;
}
