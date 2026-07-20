import express from 'express';
const router = express.Router();
import { createRoom } from '../controllers/roomController.js';

router.post('/', createRoom);

export default router;