import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Semua route project wajib login
router.use(authenticateJWT);

// List & Create
router.get('/', projectController.index);
router.get('/create', isAdmin, projectController.form);
router.post('/create', isAdmin, projectController.save);

// Single Project View & Actions
router.get('/template', isAdmin, projectController.downloadTemplate);
router.get('/:id', projectController.view);
router.get('/:id/summary/download', projectController.downloadSummary);
router.post('/:id/upload', isAdmin, projectController.uploadMiddleware, projectController.uploadCsv);
router.get('/:id/edit', isAdmin, projectController.form);
router.post('/:id/save', authenticateJWT, isAdmin, projectController.save);
router.post('/:id/complete', authenticateJWT, isAdmin, projectController.markAsCompleted);
router.get('/:id/delete', authenticateJWT, isAdmin, projectController.remove);

// User Assignment
router.post('/:id/users/assign', isAdmin, projectController.assignUser);
router.post('/:id/users/remove', isAdmin, projectController.removeUser);

export default router;
