import express from 'express';
import multer from 'multer';
import * as itemController from '../controllers/itemController.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'tmp/' });

// All item management routes require admin access
router.use(authenticateJWT, isAdmin);

router.get('/', itemController.index);
router.get('/template', itemController.downloadTemplate);
router.get('/upload', itemController.showUpload);
router.post('/upload', upload.single('csvFile'), itemController.uploadCsv);
router.get('/create', itemController.form);
router.get('/:id/edit', itemController.form);
router.get('/:id/barcodes', itemController.barcodes);
router.post('/', itemController.save);
router.post('/:id', itemController.save);
router.post('/:id/delete', itemController.remove);

export default router;
