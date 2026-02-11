import { createUploader } from "../multer.js";

export const profileImageUploader = createUploader({
  folder: "lawyers/profile",
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB: 5,
});
