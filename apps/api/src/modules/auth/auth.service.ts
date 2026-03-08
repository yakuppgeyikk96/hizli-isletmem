import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import type { AuthRepository } from "./auth.repository";
import type { RegisterInput } from "@repo/shared/types/auth";
import { ERROR_CODES } from "@repo/shared/constants/error-codes";
import type { AccessTokenPayload, RefreshTokenPayload } from "../../types/auth.types";

export type AuthService = ReturnType<typeof buildAuthService>;

interface AuthServiceDeps {
  authRepository: AuthRepository;
  fastify: FastifyInstance;
}

export function buildAuthService({ authRepository, fastify }: AuthServiceDeps) {
  const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
  const refreshTokenDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7", 10);
  const refreshTokenExpiresInMs = refreshTokenDays * 24 * 60 * 60 * 1000;

  return {
    async register(input: RegisterInput) {
      const existingUser = await authRepository.findUserByEmail(input.email);
      if (existingUser) {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
            message: "A user with this email already exists.",
          },
          statusCode: 409,
        };
      }

      const passwordHash = await argon2.hash(input.password);

      const { business, user } = await authRepository.createBusinessAndUser(
        { name: input.businessName, type: input.businessType },
        { name: input.name, email: input.email, passwordHash, role: "admin" },
      );

      const accessToken = fastify.jwt.sign(
        { sub: user.id, businessId: business.id, role: user.role } satisfies AccessTokenPayload,
        { expiresIn: accessTokenExpiresIn },
      );

      const tokenId = randomUUID();
      const refreshToken = fastify.jwt.sign(
        { sub: user.id, jti: tokenId } satisfies RefreshTokenPayload,
        { expiresIn: `${refreshTokenDays}d` },
      );

      await authRepository.createRefreshToken({
        userId: user.id,
        tokenId,
        expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
      });

      return {
        success: true as const,
        data: { user, business, accessToken, refreshToken },
      };
    },
  };
}
