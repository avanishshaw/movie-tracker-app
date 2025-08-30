import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, mediaController.create)
    .get(protect, mediaController.getAll);

router.route('/:id')
    .patch(protect, mediaController.update)
    .delete(protect, mediaController.deleteEntry);

export default router;