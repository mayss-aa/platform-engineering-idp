/**
 * UserRole — matches the backend `roles.name` field.
 * The backend stores roles dynamically in the DB, but these are the known
 * roles used in @PreAuthorize annotations and the seed data.
 */
export type UserRole = 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'VIEWER' | 'AUDITOR';

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
