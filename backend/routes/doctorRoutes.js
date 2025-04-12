import express from "express";
import { getDoctors, getDoctorById } from "../controllers/doctorDashboardController.js";

const router = express.Router();

router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);

export default router;