import { createUploader } from "../multer.js";

export const firUploader = createUploader({
  folder: "fir",
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ],
  maxSizeMB: 10,
});
