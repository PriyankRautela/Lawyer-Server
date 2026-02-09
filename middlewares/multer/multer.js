import multer from "multer";
import path from "path";
import fs from "fs";

const BASE_DIR = "uploads";

const ensureDir = (folder) => {
  const fullPath = path.join(BASE_DIR, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

export const createUploader = ({
  folder,
  allowedMimeTypes,
  maxSizeMB = 5,
}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureDir(folder));
    },
    filename: (req, file, cb) => {
      const unique =
        Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter,
  });
};
