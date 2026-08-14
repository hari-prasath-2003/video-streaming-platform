import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";

export const uploadRoot = path.resolve(env.UPLOAD_DIR);
export const videoDir = path.join(uploadRoot, "videos");
export const thumbnailDir = path.join(uploadRoot, "thumbnails");

for (const dir of [videoDir, thumbnailDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === "thumbnail" ? thumbnailDir : videoDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video" && !file.mimetype.startsWith("video/")) {
      cb(new Error("video field must be a video file"));
      return;
    }
    if (
      file.fieldname === "thumbnail" &&
      !file.mimetype.startsWith("image/")
    ) {
      cb(new Error("thumbnail field must be an image file"));
      return;
    }
    cb(null, true);
  },
});
