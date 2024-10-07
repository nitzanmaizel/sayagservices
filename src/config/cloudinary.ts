import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import path from 'path';

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME!;
const api_key = process.env.CLOUDINARY_API_KEY!;
const api_secret = process.env.CLOUDINARY_API_SECRET!;

if (!cloud_name || !api_key || !api_secret) {
  throw new Error('Cloudinary environment variables are not set');
}

cloudinary.config({ cloud_name, api_key, api_secret });

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
};

const limits = { fileSize: 5 * 1024 * 1024 };
const upload = multer({ storage: storage, limits, fileFilter: fileFilter });

const uploadToCloudinary = async (file: Express.Multer.File, folder: string) => {
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        if (result && result.secure_url) resolve(result.secure_url);
        else reject(new Error('Failed to upload image'));
      })
      .end(file.buffer);
  });
};

export { upload, uploadToCloudinary };
