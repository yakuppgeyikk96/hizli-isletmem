import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users } from "@repo/db/schema/user";
import { businesses } from "@repo/db/schema/business";
import { refreshTokens } from "@repo/db/schema/refresh-token";
import type { CreateBusinessData, CreateUserData, CreateRefreshTokenData } from "../../types/auth.types";

export type AuthRepository = ReturnType<typeof buildAuthRepository>;

export function buildAuthRepository(db: PostgresJsDatabase) {
  return {
    async findUserByEmail(email: string) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return result[0] ?? null;
    },

    async createBusinessAndUser(
      businessData: CreateBusinessData,
      userData: Omit<CreateUserData, "businessId">,
    ) {
      return db.transaction(async (tx) => {
        const [business] = await tx
          .insert(businesses)
          .values(businessData)
          .returning();

        const [user] = await tx
          .insert(users)
          .values({ ...userData, businessId: business!.id })
          .returning();

        return { business: business!, user: user! };
      });
    },

    async createRefreshToken(data: CreateRefreshTokenData) {
      const [token] = await db
        .insert(refreshTokens)
        .values(data)
        .returning();

      return token!;
    },

    async findRefreshToken(tokenId: string) {
      const result = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenId, tokenId))
        .limit(1);

      return result[0] ?? null;
    },

    async deleteRefreshToken(tokenId: string) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenId, tokenId));
    },

    async deleteUserRefreshTokens(userId: string) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, userId));
    },
  };
}
