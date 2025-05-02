import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getUserProfile, getUserDocuments, grantAccessToDoctor, getUserAppointments } from '../controllers/userDashboardController.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadDocument } from '../controllers/userDashboardController.js';


const router = express.Router();

router.get('/', verifyToken, (req, res) => {
    res.json({ message: `Welcome to your dashboard, ${req.user.fullname}` });
});

// User Profile Route
router.get('/profile', verifyToken, getUserProfile);

// Get User Documents (Accessible to Authorized Doctors or Authors)
router.get('/documents/:userId', verifyToken, getUserDocuments);

// upload document
router.post('/documents/upload', verifyToken, upload.single('file'), uploadDocument);

// giving document access to doctor
router.put("/documents/grant-access", verifyToken, grantAccessToDoctor);

router.get("/appointments", verifyToken, getUserAppointments);


export default router;