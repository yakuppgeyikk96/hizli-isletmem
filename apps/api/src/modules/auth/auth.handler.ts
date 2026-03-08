import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthService } from "./auth.service";
import type { RegisterInput, AuthResponse } from "@repo/shared/types/auth";
import type { ApiResponse } from "@repo/shared/types/api-response";
import { toUserResponse, toBusinessResponse } from "./auth.mapper";

export type AuthHandler = ReturnType<typeof buildAuthHandler>;

interface AuthHandlerDeps {
  authService: AuthService;
}

export function buildAuthHandler({ authService }: AuthHandlerDeps) {
  return {
    async register(
      request: FastifyRequest<{ Body: RegisterInput }>,
      reply: FastifyReply,
    ) {
      const result = await authService.register(request.body);

      if (!result.success) {
        const response: ApiResponse<never> = {
          success: false,
          error: result.error,
        };
        return reply.status(result.statusCode).send(response);
      }

      const { user, business, accessToken, refreshToken } = result.data;

      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: toUserResponse(user),
          business: toBusinessResponse(business),
        },
      };

      return reply.status(201).header("Authorization", `Bearer ${accessToken}`).send(response);
    },
  };
}
