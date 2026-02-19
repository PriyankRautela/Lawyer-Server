import { createUploader } from "../multer.js";

 const firUploader = createUploader({
  folder: "fir",
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ],
  maxSizeMB: 10,
});

export default firUploader;