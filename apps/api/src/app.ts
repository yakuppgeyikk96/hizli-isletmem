import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { ERROR_CODES } from "@repo/shared/constants/error-codes";
import type { ApiResponse } from "@repo/shared/types/api-response";
import authRoutes from "./modules/auth/auth.route";

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.setErrorHandler((error: Error & { validation?: unknown; statusCode?: number }, _request, reply) => {
    if (error.validation) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: error.message,
        },
      };
      return reply.status(400).send(response);
    }

    fastify.log.error(error);

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "An unexpected error occurred.",
      },
    };
    return reply.status(error.statusCode ?? 500).send(response);
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
  });

  fastify.register(authRoutes, { prefix: "/api/v1/auth" });
};

export default app;
