export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  /** Email address or phone number. */
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  user: PublicUser;
}

export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';
