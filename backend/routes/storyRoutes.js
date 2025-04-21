// const express = require("express");
// const router = express.Router();
// const { addStory, getDoctorStories } = require("../controllers/storyController");

// router.post("/add", addStory);
// router.get("/doctor/:doctorId", getDoctorStories); // to fetch all stories for a doctor

// module.exports = router;


import express from "express";
import { submitStory, getStoriesByDoctor } from "../controllers/storyController.js";
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to submit a new story (requires login)
router.post("/add", verifyToken, submitStory);

// Route to fetch all stories for a specific doctor
router.get("/doctor/:doctorId", getStoriesByDoctor);

export default router;