import fp from "fastify-plugin";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare module "fastify" {
  interface FastifyInstance {
    db: PostgresJsDatabase;
  }
}

export default fp(async (fastify) => {
  const client = postgres({
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5435,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
  const db = drizzle(client);

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await client.end();
  });
});
