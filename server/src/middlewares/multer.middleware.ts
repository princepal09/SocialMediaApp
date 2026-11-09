import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: tmpdir(),
  filename(req, _file, callback) {
    const name = `pixora-${randomUUID()}`;
    const cleanup = () => {
      void rm(join(tmpdir(), name), { force: true }).catch((error: Error) => {
        console.error("Upload cleanup failed:", error.message);
      });
    };
    req.res?.once("close", cleanup);
    callback(null, name);
  },
});

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function createUploader(maxFileSize: number) {
  return multer({
    storage,
    limits: { files: 1, fileSize: maxFileSize, fields: 5, fieldSize: 128 * 1024 },
    fileFilter(_req, file, callback) {
      const supported = file.fieldname === "video" ? videoTypes : imageTypes;
      if (!supported.has(file.mimetype)) {
        return callback(new ApiError(415, "Unsupported image or video format."));
      }
      callback(null, true);
    },
  });
}

export const upload = createUploader(50 * 1024 * 1024);
export const uploadImage = createUploader(5 * 1024 * 1024);
