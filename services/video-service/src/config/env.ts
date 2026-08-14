import "dotenv/config";
import { z } from "zod";
import logger from "@video-streaming/logger";

const envSchema = z.object({
  SERVER_PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  UPLOAD_DIR: z.string().default("uploads"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error("Invalid environment variables");
  logger.error(result.error.issues);
  process.exit(1);
}

export const env = result.data;
