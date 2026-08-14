import "dotenv/config";
import { z } from "zod";
import logger from "@video-streaming/logger";

const envSchema = z.object({
  SERVER_PORT: z.coerce.number().int().positive().default(3000),

  // search-service owns no tables of its own — it fans a query out to the
  // services that do and merges what comes back.
  USER_SERVICE_URL: z.url(),
  VIDEO_SERVICE_URL: z.url(),

  // A slow upstream must not hold the whole search open; whichever half misses
  // the deadline is dropped from the response.
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error("Invalid environment variables");
  logger.error(result.error.issues);
  process.exit(1);
}

export const env = result.data;
