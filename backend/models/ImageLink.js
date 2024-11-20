import mongoose from "mongoose";

const imageLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "ImageFolder" },
  createdAt: { type: Date, default: Date.now },
});

export const ImageLink = mongoose.model("ImageLink", imageLinkSchema);
