import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getDoctorProfile, updateDoctorProfile, addAvailability, updateAvailability, deleteAvailability, uploadDocumentAsDoctor, getSharedDocuments } from '../controllers/doctorDashboardController.js';
import upload from '../middleware/multerMiddleware.js';


const router = express.Router();

router.get('/profile', verifyToken, getDoctorProfile);
router.put('/profile', verifyToken, updateDoctorProfile);
router.post('/upload-document/:userId', verifyToken, upload.single('file'), uploadDocumentAsDoctor);
router.get('/shared-documents', verifyToken, getSharedDocuments);

// Availability Routes
router.post('/availability', verifyToken, addAvailability);
router.put('/availability', verifyToken, updateAvailability);
router.delete('/availability', verifyToken, deleteAvailability);

export default router;
