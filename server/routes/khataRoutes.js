import express from 'express';
import { protect } from '../server.js';
import { 
  getKhataEntries, 
  createKhataEntry, 
  settleKhataEntry, 
  deleteKhataEntry 
} from '../controllers/khataController.js';

const router = express.Router();

router.route('/')
  .get(protect, getKhataEntries)
  .post(protect, createKhataEntry);

router.route('/:id/settle')
  .put(protect, settleKhataEntry);

router.route('/:id')
  .delete(protect, deleteKhataEntry);

export default router;
