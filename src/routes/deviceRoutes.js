import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All device management routes require admin access
router.use(authenticateJWT, isAdmin);

router.get('/', deviceController.index);
router.get('/create', deviceController.create);
router.post('/', deviceController.store);
router.get('/:id/edit', deviceController.edit);
router.post('/:id', deviceController.update);
router.post('/:id/delete', deviceController.remove);

export default router;
