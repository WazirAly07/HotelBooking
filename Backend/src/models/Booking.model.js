import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["tour", "hotel"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "typeModel",
    },
    typeModel: {
      type: String,
      required: true,
      enum: ["Tour", "Hotel"],
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
