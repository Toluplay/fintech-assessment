export interface AccessTokenPayload {
  /** Subject: the user id. */
  sub: string;
  email: string;
  /** Roles drive authorization on the server; the UI only uses them for display. */
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  /** Identifies the session so a single refresh token can be revoked. */
  sid: string;
  iat?: number;
  exp?: number;
}

/** The only user fields the API ever sends to the browser. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  /** Seconds until the access token expires; lets the client refresh proactively. */
  expiresIn: number;
  user: PublicUser;
}
