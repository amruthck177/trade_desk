import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Programmatically create folders to prevent write failures
const voiceDir = './uploads/voice';
const logoDir = './uploads/logos';
const invoiceDir = './uploads/invoices';

[voiceDir, logoDir, invoiceDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      cb(null, logoDir);
    } else {
      cb(null, voiceDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
