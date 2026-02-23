import multer from "multer";
import path from "path";
import fs from "fs";

const baseDir = "uploads/fir";

const ensureDir = (folder) => {
  const fullPath = path.join(baseDir, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "uploadedFirCopy") {
      cb(null, ensureDir("firCopies"));
    } else if (file.fieldname === "idProof") {
      cb(null, ensureDir("idProofs"));
    } else {
      cb(new Error("Invalid file field"));
    }
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }

  cb(null, true);
};

export const firUploader = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter,
});