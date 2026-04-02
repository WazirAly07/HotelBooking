import { Hotel } from "../models/Hotel.model.js";

const getAllHotels = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const hotels = await Hotel.find(query);
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    const savedHotel = await hotel.save();
    res.status(201).json(savedHotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getAllHotels, getHotelById, createHotel };
