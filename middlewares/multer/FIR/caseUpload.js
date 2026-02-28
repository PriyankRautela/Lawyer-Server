// middlewares/caseUpload.js
import { createUploader } from "../multer.js";

export const caseUploader = createUploader({
  folder: "cases",
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ],
  maxSizeMB: 10,
});