import type { z } from "zod/v4";
import type { registerInputSchema, loginInputSchema } from "../schemas/auth";
import type { UserResponse } from "./user";
import type { BusinessResponse } from "./business";

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

export interface AuthResponse {
  user: UserResponse;
  business: BusinessResponse;
}
