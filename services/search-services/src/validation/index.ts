import { z } from "zod";
import { ValidationError } from "@video-streaming/common";

/**
 * Parse a request payload, converting zod failures into the ValidationError
 * the shared error middleware already knows how to render.
 */
export function parse<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ValidationError(
      "Invalid request payload.",
      400,
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return result.data;
}

/**
 * `type` narrows the fan-out to a single upstream. The frontend uses it to page
 * further into videos without re-running the profile and channel halves.
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "A search term is required.").max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().min(1).optional(),
  type: z.enum(["all", "profile", "channel", "video"]).default("all"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
