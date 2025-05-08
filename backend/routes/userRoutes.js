import express from "express";
import { getUserById } from "../controllers/userDashboardController.js";

const router = express.Router();

router.get("/users/:id", getUserById);

export default router;