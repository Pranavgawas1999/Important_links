import express from "express";
import { ImageLink } from "../models/ImageLink.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { folder } = req.query;
    let query = {};

    // If no folder parameter is provided, show only root-level images (folder: null)
    if (!folder) {
      query = { folder: null };
    }
    // If folder parameter is provided, show images from that specific folder
    else {
      query = { folder: folder };
    }

    const images = await ImageLink.find(query).populate('folder');
    res.json(images);
  } catch (err) {
    console.error('Error fetching image links:', err);
    res.status(500).json({ error: "Failed to fetch image links" });
  }
});

// Add a new image link
router.post("/", async (req, res) => {
  try {
    const { url, folder } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const newImage = new ImageLink({
      url,
      folder: folder || null
    });

    const savedImage = await newImage.save();
    const populatedImage = await ImageLink.findById(savedImage._id).populate('folder');
    res.status(201).json(populatedImage);
  } catch (err) {
    console.error('Error adding image link:', err);
    res.status(500).json({ error: "Failed to add image link" });
  }
});

// Delete an image link
router.delete("/:id", async (req, res) => {
  try {
    const result = await ImageLink.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Image link not found" });
    }
    res.json({ message: "Image link deleted successfully" });
  } catch (err) {
    console.error('Error deleting image link:', err);
    res.status(500).json({ error: "Failed to delete image link" });
  }
});

export default router;