"use server";

import { cookies } from "next/headers";
import type { ApiResponse } from "@repo/shared/types/api-response";
import type { AuthResponse, LoginInput, RegisterInput } from "@repo/shared/types/auth";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:3001";
const ACCESS_TOKEN_MAX_AGE = 900; // 15 minutes in seconds
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function loginAction(
  input: LoginInput,
): Promise<ApiResponse<AuthResponse>> {
  return authenticateWithApi("/api/v1/auth/login", input);
}

export async function registerAction(
  input: RegisterInput,
): Promise<ApiResponse<AuthResponse>> {
  return authenticateWithApi("/api/v1/auth/register", input);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : {}),
    },
  }).catch(() => {
    // Best-effort logout: ignore network errors
  });

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

async function authenticateWithApi(
  path: string,
  body: LoginInput | RegisterInput,
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as ApiResponse<AuthResponse>;

    if (!json.success) {
      return json;
    }

    const accessToken = extractAccessToken(response);
    const refreshToken = extractRefreshToken(response);

    if (!accessToken || !refreshToken) {
      return { success: false, error: { code: "INTERNAL_ERROR" } };
    }

    await setAuthCookies(accessToken, refreshToken);

    return json;
  } catch (error: unknown) {
    console.error("Auth request failed:", path, error);
    return { success: false, error: { code: "INTERNAL_ERROR" } };
  }
}

function extractAccessToken(response: Response): string | null {
  const authHeader = response.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function extractRefreshToken(response: Response): string | null {
  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) return null;

  const match = setCookieHeader.match(/refreshToken=([^;]+)/);
  return match?.[1] ?? null;
}

async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });
}
