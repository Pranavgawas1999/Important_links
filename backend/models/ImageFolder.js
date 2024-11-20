import mongoose from "mongoose";

const imageFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "ImageFolder", default: null },
  createdAt: { type: Date, default: Date.now },
});

export const ImageFolder = mongoose.model("ImageFolder", imageFolderSchema);
