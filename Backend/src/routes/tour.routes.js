import express from "express";
import { getAllTours, getTourById, createTour } from "../controllers/tourController.js";

const router = express.Router();

router.get("/", getAllTours);
router.get("/:id", getTourById);
router.post("/", createTour);

export default router;
