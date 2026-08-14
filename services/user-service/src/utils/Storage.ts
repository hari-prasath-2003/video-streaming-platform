import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { ValidationError } from "@video-streaming/common";
import { env } from "../config/env.js";

export const uploadRoot = path.resolve(env.UPLOAD_DIR);
export const avatarDir = path.join(uploadRoot, "avatars");
export const bannerDir = path.join(uploadRoot, "banners");

for (const dir of [avatarDir, bannerDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === "banner" ? bannerDir : avatarDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  // Profile imagery is small — a 5MB cap keeps a stray video upload from
  // filling the disk here.
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ValidationError(`The ${file.fieldname} must be an image file.`));
      return;
    }

    cb(null, true);
  },
});

/**
 * Gateway-facing URL for a stored image. The frontend talks to the gateway,
 * not this service, so the "/api/user" prefix stays in the persisted value.
 */
export function mediaUrl(kind: "avatars" | "banners", filename: string) {
  return `/api/user/media/${kind}/${filename}`;
}

/**
 * Delete a previously uploaded image once it has been replaced.
 *
 * Only paths this service minted are touched — a user-supplied external URL is
 * left alone, and path traversal is ruled out by taking just the basename.
 */
export function removeStoredImage(url: string | null | undefined) {
  if (!url) return;

  const match = /^\/api\/user\/media\/(avatars|banners)\/([^/]+)$/.exec(url);

  if (!match) return;

  const dir = match[1] === "banners" ? bannerDir : avatarDir;

  fs.rm(path.join(dir, path.basename(match[2]!)), { force: true }, () => {
    // Best effort: a missing file is not worth failing the request over.
  });
}
