/**
 * Core user data returned by auth providers (Steam OpenID or mock).
 */
export interface AuthUser {
  steamId64: string;
  username: string;
  avatarUrl: string;
}

/**
 * Contract for authentication providers.
 * Implementations: MockProvider (dev), SteamProvider (production).
 */
export interface IAuthProvider {
  getLoginUrl(returnUrl: string): string;
  handleCallback(params: Record<string, string>): Promise<AuthUser | null>;
  getProviderName(): string;
}

/**
 * Authenticated session user — AuthUser enriched with DB fields.
 * Stored in the JWT session cookie.
 */
export interface SessionUser extends AuthUser {
  id: number;
  balance: number;
  isAdmin: boolean;
}
