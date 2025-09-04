// src/routes/media.routes.js
import express from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    // UPDATED: Removed upload.single('poster')
    .post(protect, mediaController.create)
    .get(protect, mediaController.getAll);

router.route('/:id')
    // UPDATED: Removed upload.single('poster')
    .patch(protect, mediaController.update)
    .delete(protect, mediaController.deleteEntry);

export default router;