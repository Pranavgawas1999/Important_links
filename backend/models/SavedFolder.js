import mongoose from "mongoose";

const savedFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "SavedFolder", default: null },
  createdAt: { type: Date, default: Date.now },
});

export const SavedFolder = mongoose.model("SavedFolder", savedFolderSchema);
