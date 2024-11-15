import express from 'express';
import { createSavedLink, getSavedLinks, deleteSavedLink } from '../controllers/savedLinkController.js';

const router = express.Router();

router.post('/saved-links', createSavedLink);
router.get('/saved-links', getSavedLinks);
router.delete('/saved-links/:id', deleteSavedLink);

export default router;
