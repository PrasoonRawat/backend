import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requestAppointment, getUserAppointments, getDoctorAppointments, respondToAppointment } from '../controllers/appointmentsController.js';

const router = express.Router();

router.post('/request', verifyToken, requestAppointment);
router.patch('/respond', verifyToken, respondToAppointment);
router.get('/user', verifyToken, getUserAppointments);
router.get('/doctor', verifyToken, getDoctorAppointments);

export default router;