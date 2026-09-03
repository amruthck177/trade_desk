import express from 'express';
import { protect } from '../server.js';
import { 
  getStaffList, 
  createStaff, 
  recordStaffPayout, 
  deleteStaff 
} from '../controllers/staffController.js';

const router = express.Router();

router.route('/')
  .get(protect, getStaffList)
  .post(protect, createStaff);

router.route('/:id/payout')
  .post(protect, recordStaffPayout);

router.route('/:id')
  .delete(protect, deleteStaff);

export default router;
