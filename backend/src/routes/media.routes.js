import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, mediaController.create)
    .get(protect, mediaController.getAll);

router.route('/:id')
    .patch(protect, mediaController.update)
    .delete(protect, mediaController.deleteEntry);

router.route('/')
    .post(protect, upload.single('poster'), mediaController.create) // Use middleware here for a single file named 'poster'
    .get(protect, mediaController.getAll);

export default router;