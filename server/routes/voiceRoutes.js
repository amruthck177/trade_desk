import express from 'express';
import { parseVoiceNote } from '../controllers/voiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/parse', protect, upload.single('audio'), parseVoiceNote);

export default router;
