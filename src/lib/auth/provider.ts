import { mockAuthProvider } from "@/lib/auth/mock-provider";
import { steamAuthProvider } from "@/lib/auth/steam-provider";

export function getAuthProvider() {
  if (process.env.AUTH_MODE === "steam" && process.env.STEAM_API_KEY) {
    return steamAuthProvider;
  }

  return mockAuthProvider;
}
