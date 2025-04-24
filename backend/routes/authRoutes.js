import express from 'express';
import { registerUser, registerDoctor, login, refreshAccessToken } from '../controllers/authController.js';


const router = express.Router();

// refresh-token

router.post("/refresh-token", refreshAccessToken);


// Authentication Routes
router.post('/register/user', registerUser);
router.post('/register/doctor', registerDoctor);
router.post('/login', login);

export default router;