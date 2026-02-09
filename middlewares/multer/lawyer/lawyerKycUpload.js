import { createUploader } from "../multer.js";

const lawyerKycUpload = createUploader({
  folder: "kyc/lawyer",
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  maxSizeMB: 5,
});

export default lawyerKycUpload;
