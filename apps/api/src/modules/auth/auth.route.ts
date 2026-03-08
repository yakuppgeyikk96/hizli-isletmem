import type { FastifyInstance } from "fastify";
import { registerInputSchema } from "@repo/shared/schemas/auth";
import { buildAuthRepository } from "./auth.repository";
import { buildAuthService } from "./auth.service";
import { buildAuthHandler } from "./auth.handler";

export default async function authRoutes(fastify: FastifyInstance) {
  const authRepository = buildAuthRepository(fastify.db);
  const authService = buildAuthService({ authRepository, fastify });
  const authHandler = buildAuthHandler({ authService });

  fastify.post(
    "/register",
    {
      schema: {
        body: registerInputSchema,
      },
    },
    authHandler.register,
  );
}
