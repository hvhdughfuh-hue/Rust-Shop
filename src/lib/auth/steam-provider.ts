import type { AuthUser, IAuthProvider } from "@/lib/auth/types";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAM_PROFILE_ENDPOINT =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";

function fallbackAvatar(steamId64: string) {
  const initials = steamId64.slice(-2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="12" fill="#111214" />
      <rect x="6" y="6" width="84" height="84" rx="10" fill="#ff4d1f" opacity="0.9" />
      <path d="M20 66h56v7H20zM26 29h44v8H26zM32 44h32v7H32z" fill="#050608" opacity="0.32" />
      <text x="48" y="59" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#fff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function extractSteamId(claimedId?: string) {
  if (!claimedId) {
    return null;
  }

  const match = claimedId.match(/steamcommunity\.com\/openid\/id\/(\d+)$/);
  return match?.[1] ?? null;
}

async function loadSteamProfile(steamId64: string): Promise<AuthUser> {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return {
      steamId64,
      username: `Steam ${steamId64.slice(-6)}`,
      avatarUrl: fallbackAvatar(steamId64),
    };
  }

  const url = new URL(STEAM_PROFILE_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamids", steamId64);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return {
      steamId64,
      username: `Steam ${steamId64.slice(-6)}`,
      avatarUrl: fallbackAvatar(steamId64),
    };
  }

  const data = (await response.json()) as {
    response?: {
      players?: Array<{
        personaname?: string;
        avatarfull?: string;
        avatarmedium?: string;
      }>;
    };
  };
  const player = data.response?.players?.[0];

  return {
    steamId64,
    username: player?.personaname || `Steam ${steamId64.slice(-6)}`,
    avatarUrl: player?.avatarfull || player?.avatarmedium || fallbackAvatar(steamId64),
  };
}

export class SteamAuthProvider implements IAuthProvider {
  getLoginUrl(returnUrl: string): string {
    const realm = new URL(returnUrl).origin;
    const url = new URL(STEAM_OPENID_ENDPOINT);

    url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    url.searchParams.set("openid.mode", "checkid_setup");
    url.searchParams.set(
      "openid.identity",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );
    url.searchParams.set(
      "openid.claimed_id",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );
    url.searchParams.set("openid.return_to", returnUrl);
    url.searchParams.set("openid.realm", realm);

    return url.toString();
  }

  async handleCallback(params: Record<string, string>): Promise<AuthUser | null> {
    if (params["openid.mode"] !== "id_res") {
      return null;
    }

    const verification = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (key.startsWith("openid.")) {
        verification.set(key, value);
      }
    });
    verification.set("openid.mode", "check_authentication");

    const response = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verification.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.text();

    if (!result.includes("is_valid:true")) {
      return null;
    }

    const steamId64 = extractSteamId(
      params["openid.claimed_id"] || params["openid.identity"],
    );

    if (!steamId64) {
      return null;
    }

    return loadSteamProfile(steamId64);
  }

  getProviderName(): string {
    return "steam";
  }
}

export const steamAuthProvider = new SteamAuthProvider();
