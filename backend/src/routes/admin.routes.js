import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();
const adminAuth = [protect, isAdmin];

router.patch('/media/:id/approve', adminAuth, mediaController.approveMedia);
router.patch('/media/:id/reject', adminAuth, mediaController.rejectMedia);
router.get('/media/pending', adminAuth, mediaController.getPending);

export default router;