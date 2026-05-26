import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { SessionUser } from "@/lib/auth/types";

const SESSION_COOKIE = "rust_store_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface SessionPayload {
  id: number;
  steamId64: string;
  username: string;
  avatarUrl: string;
  balance: number;
  isAdmin: boolean;
}

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function signSession(user: SessionUser) {
  const payload: SessionPayload = {
    id: user.id,
    steamId64: user.steamId64,
    username: user.username,
    avatarUrl: user.avatarUrl,
    balance: user.balance,
    isAdmin: user.isAdmin,
  };

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

async function readToken(token?: string): Promise<SessionUser | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = Number(payload.id);

    if (!Number.isInteger(id)) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      steamId64: user.steamId64,
      username: user.username,
      avatarUrl: user.avatarUrl,
      balance: user.balance,
      isAdmin: user.isAdmin,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return readToken(token);
}

export async function setSessionCookie(response: NextResponse, user: SessionUser) {
  const token = await signSession(user);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
