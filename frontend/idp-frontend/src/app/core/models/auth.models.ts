export type UserRole = 'ADMIN' | 'DEVELOPER' | 'VIEWER' | 'APPROVER' | 'OPERATOR';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  lastLogin: string; // ISO 8601
}

export interface AuthTokens {
  accessToken: string;   // in-memory only — never written to localStorage
  refreshToken?: string; // session-storage (no remember-me) or HttpOnly cookie (remember-me)
  expiresAt: number;     // Unix timestamp (ms)
}
