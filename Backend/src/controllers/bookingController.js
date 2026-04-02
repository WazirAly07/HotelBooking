import { Booking } from "../models/Booking.model.js";
import { Tour } from "../models/Tour.model.js";
import { Hotel } from "../models/Hotel.model.js";

const createBooking = async (req, res) => {
  try {
    const { type, targetId, customerName, customerEmail, bookingDate } = req.body;
    
    const typeModel = type === "tour" ? "Tour" : "Hotel";
    
    const booking = new Booking({
      type,
      targetId,
      typeModel,
      customerName,
      customerEmail,
      bookingDate
    });
    
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("targetId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createBooking, getAllBookings };
