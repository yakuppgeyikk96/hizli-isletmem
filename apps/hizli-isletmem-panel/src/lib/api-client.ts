import type { ApiResponse } from "@repo/shared/types/api-response";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:3001";

export async function fetchApi<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    return (await response.json()) as ApiResponse<T>;
  } catch (error: unknown) {
    console.error("API request failed:", path, error);
    return { success: false, error: { code: "INTERNAL_ERROR" } };
  }
}
