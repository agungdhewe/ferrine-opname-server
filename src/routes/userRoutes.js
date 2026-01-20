import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All user management routes require admin access
router.use(authenticateJWT, isAdmin);

router.get('/', userController.index);
router.get('/create', userController.create);
router.post('/', userController.store);
router.get('/:username/edit', userController.edit);
router.post('/:username', userController.update);
router.post('/:username/delete', userController.remove);

export default router;
