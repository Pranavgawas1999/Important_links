import express from 'express';
import { createImageLink, getImageLinks, deleteImageLink } from '../controllers/imageLinkController.js';

const router = express.Router();

router.post('/image-links', createImageLink);
router.get('/image-links', getImageLinks);
router.delete('/image-links/:id', deleteImageLink);

export default router;
