// src/routes/media.routes.js
import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('poster'), mediaController.create)
    .get(protect, mediaController.getAll);

router.route('/:id')
    // UPDATED: Added upload.single('poster') middleware
    .patch(protect, upload.single('poster'), mediaController.update)
    .delete(protect, mediaController.deleteEntry);

export default router;