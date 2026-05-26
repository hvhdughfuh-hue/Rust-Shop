import type { AuthUser, IAuthProvider } from "@/lib/auth/types";

function avatarDataUrl(seed: string, label: string, from: string, to: string) {
  const initials = label
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 2)
    .toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${from}" />
          <stop offset="1" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="12" fill="#18181b" />
      <rect x="4" y="4" width="88" height="88" rx="10" fill="url(#g)" opacity="0.9" />
      <path d="M18 66h60v8H18zM25 28h46v8H25zM32 43h32v7H32z" fill="#09090b" opacity="0.32" />
      <text x="48" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#fafafa">${initials}</text>
      <text x="48" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#fafafa" opacity="0.75">${seed.slice(-4)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MOCK_AUTH_USERS: AuthUser[] = [
  {
    steamId64: "76561198000000001",
    username: "RustLord",
    avatarUrl: avatarDataUrl("76561198000000001", "RustLord", "#f97316", "#7c2d12"),
  },
  {
    steamId64: "76561198000000002",
    username: "BaseBuilder",
    avatarUrl: avatarDataUrl("76561198000000002", "BaseBuilder", "#10b981", "#164e63"),
  },
  {
    steamId64: "76561198000000003",
    username: "RaidMaster",
    avatarUrl: avatarDataUrl("76561198000000003", "RaidMaster", "#ef4444", "#451a03"),
  },
  {
    steamId64: "76561198000000004",
    username: "NakedNewman",
    avatarUrl: avatarDataUrl("76561198000000004", "NakedNewman", "#38bdf8", "#1e3a8a"),
  },
  {
    steamId64: "76561198000000005",
    username: "ChadSurvivor",
    avatarUrl: avatarDataUrl("76561198000000005", "ChadSurvivor", "#a3e635", "#365314"),
  },
];

export class MockAuthProvider implements IAuthProvider {
  getLoginUrl(returnUrl: string): string {
    const url = new URL("/api/auth/login", "http://localhost");
    url.searchParams.set("returnTo", returnUrl);
    return `${url.pathname}${url.search}`;
  }

  async handleCallback(params: Record<string, string>): Promise<AuthUser | null> {
    const steamId = params.steamId;
    return MOCK_AUTH_USERS.find((user) => user.steamId64 === steamId) ?? null;
  }

  getProviderName(): string {
    return "mock";
  }
}

export const mockAuthProvider = new MockAuthProvider();
