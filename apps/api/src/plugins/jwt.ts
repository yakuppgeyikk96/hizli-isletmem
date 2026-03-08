import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async (fastify) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  fastify.register(jwt, { secret });
});
