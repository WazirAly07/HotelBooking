import express from "express";
import { getAllHotels, getHotelById, createHotel } from "../controllers/hotelController.js";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.post("/", createHotel);

export default router;
