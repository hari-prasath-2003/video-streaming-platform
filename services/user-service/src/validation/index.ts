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

const username = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(
    /^[a-z0-9_.]+$/i,
    "Username may only contain letters, numbers, underscores and dots.",
  );

const handle = z
  .string()
  .trim()
  .min(3)
  .max(40)
  .regex(
    /^[a-z0-9_.-]+$/i,
    "Handle may only contain letters, numbers, underscores, dots and dashes.",
  );

// Avatars/banners are stored as URLs for now (there is no image upload
// endpoint yet), so accept an absolute URL or a gateway-relative media path.
const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "Must be an absolute URL or a root-relative path.",
  );

export const createProfileSchema = z.object({
  username,
  displayName: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(1000).optional(),
  avatarUrl: imageUrl.optional(),
  bannerUrl: imageUrl.optional(),
});

export const updateProfileSchema = z
  .object({
    username: username.optional(),
    displayName: z.string().trim().min(1).max(100).optional(),
    bio: z.string().trim().max(1000).nullable().optional(),
    avatarUrl: imageUrl.nullable().optional(),
    bannerUrl: imageUrl.nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );

export const createChannelSchema = z.object({
  handle,
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).optional(),
  avatarUrl: imageUrl.optional(),
  bannerUrl: imageUrl.optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export const updateChannelSchema = z
  .object({
    handle: handle.optional(),
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    avatarUrl: imageUrl.nullable().optional(),
    bannerUrl: imageUrl.nullable().optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );

/**
 * The account editor saves the profile and the channel from a single form,
 * so both halves are optional and applied together.
 */
export const updateAccountSchema = z
  .object({
    profile: updateProfileSchema.optional(),
    channel: updateChannelSchema.optional(),
  })
  .refine(
    (data) => data.profile !== undefined || data.channel !== undefined,
    "Provide a profile and/or a channel patch.",
  );

export const bootstrapAccountSchema = z.object({
  username: username.optional(),
  displayName: z.string().trim().min(1).max(100).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "A search term is required.").max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// The schemas are the single source of truth for these payload shapes — the
// services and repositories below take these types rather than restating them.
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type BootstrapAccountInput = z.infer<typeof bootstrapAccountSchema>;
