import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { getAuthProvider } from "@/lib/auth/provider";
import { MOCK_AUTH_USERS } from "@/lib/auth/mock-provider";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { findOrCreateUser } from "@/lib/services/user-service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ action?: string[] }>;
};

function safeReturnTo(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("returnTo") || "/";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function redirectUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, request.url);
}

async function handleLogin(request: NextRequest) {
  const provider = getAuthProvider();
  const returnTo = safeReturnTo(request);

  if (provider.getProviderName() !== "mock") {
    const callbackUrl = redirectUrl(request, "/api/auth/callback");
    callbackUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(provider.getLoginUrl(callbackUrl.toString()));
  }

  const steamId = request.nextUrl.searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({
      provider: "mock",
      users: MOCK_AUTH_USERS,
    });
  }

  const callbackUrl = redirectUrl(request, "/api/auth/callback");
  callbackUrl.searchParams.set("steamId", steamId);
  callbackUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(callbackUrl);
}

async function handleCallback(request: NextRequest) {
  const provider = getAuthProvider();
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const authUser = await provider.handleCallback(params);

  if (!authUser) {
    throw new AppError("Unable to authenticate user.", 401, "AUTH_FAILED");
  }

  const user = await findOrCreateUser(authUser);
  const response = NextResponse.redirect(redirectUrl(request, safeReturnTo(request)));
  await setSessionCookie(response, user);

  return response;
}

async function handleSession() {
  const user = await getSession();
  return NextResponse.json({ user });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { action = [] } = await context.params;
    const name = action[0];

    if (name === "login") {
      return handleLogin(request);
    }

    if (name === "callback") {
      return handleCallback(request);
    }

    if (name === "session") {
      return handleSession();
    }

    throw new AppError("Auth route not found.", 404, "NOT_FOUND");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { action = [] } = await context.params;
    const name = action[0];

    if (name !== "logout") {
      throw new AppError("Auth route not found.", 404, "NOT_FOUND");
    }

    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
