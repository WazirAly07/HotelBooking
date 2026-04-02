import { Tour } from "../models/Tour.model.js";

const getAllTours = async (req, res) => {
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

    const tours = await Tour.find(query);
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTour = async (req, res) => {
  try {
    const tour = new Tour(req.body);
    const savedTour = await tour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getAllTours, getTourById, createTour };
