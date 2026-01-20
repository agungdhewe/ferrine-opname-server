import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, dashboardController.showDashboard);

export default router;
