import { createUploader } from "../multer.js";

export const userProfileImageUploader = createUploader({
  folder: "users/profile",
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB: 5,
});
