import express from "express";
import { getAllFeedback, createFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/", getAllFeedback);
router.post("/", createFeedback);

export default router;
