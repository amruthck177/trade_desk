import express from 'express';
import { 
  getRateCards, 
  createRateCard, 
  updateRateCard, 
  deleteRateCard 
} from '../controllers/rateCardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRateCards);
router.post('/', createRateCard);
router.put('/:id', updateRateCard);
router.delete('/:id', deleteRateCard);

export default router;
