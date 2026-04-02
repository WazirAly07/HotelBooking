import express from "express";
import cors from "cors";
import tourRoutes from "./routes/tour.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/tours", tourRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/feedback", feedbackRoutes);

export { app };
