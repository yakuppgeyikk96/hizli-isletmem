import Fastify from "fastify";
import app from "./app";

const server = Fastify({
  logger: true,
});

server.register(app);

const host = process.env.API_HOST || "0.0.0.0";
const port = Number(process.env.API_PORT) || 3001;

server.listen({ host, port }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
