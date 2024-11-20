import mongoose from "mongoose";

const savedLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "SavedFolder" },
  createdAt: { type: Date, default: Date.now },
});

export const SavedLink = mongoose.model("SavedLink", savedLinkSchema);
