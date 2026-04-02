import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    plan: {
      type: [String], // Array of strings representing daily plans
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Tour = mongoose.model("Tour", tourSchema);
