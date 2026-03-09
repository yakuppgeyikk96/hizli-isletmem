import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import type { AuthRepository } from "./auth.repository";
import type { RegisterInput, LoginInput } from "@repo/shared/types/auth";
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

    async login(input: LoginInput) {
      const user = await authRepository.findUserByEmail(input.email);
      if (!user) {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: "Invalid email or password.",
          },
          statusCode: 401,
        };
      }

      if (!user.isActive) {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.USER_DEACTIVATED,
            message: "This account has been deactivated.",
          },
          statusCode: 401,
        };
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
      if (!isPasswordValid) {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: "Invalid email or password.",
          },
          statusCode: 401,
        };
      }

      const business = await authRepository.findBusinessById(user.businessId);

      const accessToken = fastify.jwt.sign(
        { sub: user.id, businessId: user.businessId, role: user.role } satisfies AccessTokenPayload,
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
        data: { user, business: business!, accessToken, refreshToken },
      };
    },

    async refresh(refreshTokenCookie: string) {
      let payload: RefreshTokenPayload;
      try {
        payload = fastify.jwt.verify<RefreshTokenPayload>(refreshTokenCookie);
      } catch {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.TOKEN_INVALID,
            message: "Invalid or expired refresh token.",
          },
          statusCode: 401,
        };
      }

      const storedToken = await authRepository.findRefreshToken(payload.jti);
      if (!storedToken) {
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.TOKEN_INVALID,
            message: "Refresh token has been revoked.",
          },
          statusCode: 401,
        };
      }

      const user = await authRepository.findUserById(payload.sub);
      if (!user || !user.isActive) {
        await authRepository.deleteRefreshToken(payload.jti);
        return {
          success: false as const,
          error: {
            code: ERROR_CODES.USER_DEACTIVATED,
            message: "This account has been deactivated.",
          },
          statusCode: 401,
        };
      }

      await authRepository.deleteRefreshToken(payload.jti);

      const business = await authRepository.findBusinessById(user.businessId);

      const accessToken = fastify.jwt.sign(
        { sub: user.id, businessId: user.businessId, role: user.role } satisfies AccessTokenPayload,
        { expiresIn: accessTokenExpiresIn },
      );

      const newTokenId = randomUUID();
      const newRefreshToken = fastify.jwt.sign(
        { sub: user.id, jti: newTokenId } satisfies RefreshTokenPayload,
        { expiresIn: `${refreshTokenDays}d` },
      );

      await authRepository.createRefreshToken({
        userId: user.id,
        tokenId: newTokenId,
        expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
      });

      return {
        success: true as const,
        data: { user, business: business!, accessToken, refreshToken: newRefreshToken },
      };
    },

    async logout(refreshTokenCookie: string) {
      try {
        const payload = fastify.jwt.verify<RefreshTokenPayload>(refreshTokenCookie);
        await authRepository.deleteRefreshToken(payload.jti);
      } catch {
        // Token invalid/expired — still clear cookie, no error
      }
    },
  };
}
