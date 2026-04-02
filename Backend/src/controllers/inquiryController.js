import { Inquiry } from "../models/Inquiry.model.js";

const createInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();
    res.status(201).json({ message: "Inquiry sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createInquiry, getAllInquiries };
