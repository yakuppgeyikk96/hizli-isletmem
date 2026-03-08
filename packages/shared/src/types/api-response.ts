import type { ErrorCode } from "../constants/error-codes";

export interface ApiError {
  code: ErrorCode;
  message: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
