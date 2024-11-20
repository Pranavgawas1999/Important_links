import express from "express";
import { SavedLink } from "../models/SavedLink.js";

const router = express.Router();

// Get saved links - either from root or specific folder
router.get("/", async (req, res) => {
  try {
    const { folder } = req.query;
    let query = {};

    // If no folder parameter is provided, show only root-level links (folder: null)
    if (!folder) {
      query = { folder: null };
    }
    // If folder parameter is provided, show links from that specific folder
    else {
      query = { folder: folder };
    }

    const links = await SavedLink.find(query).populate('folder');
    res.json(links);
  } catch (err) {
    console.error('Error fetching saved links:', err);
    res.status(500).json({ error: "Failed to fetch saved links" });
  }
});

// Add a new saved link
router.post("/", async (req, res) => {
  try {
    const { url, folder } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const newLink = new SavedLink({
      url,
      folder: folder || null
    });

    const savedLink = await newLink.save();
    const populatedLink = await SavedLink.findById(savedLink._id).populate('folder');
    res.status(201).json(populatedLink);
  } catch (err) {
    console.error('Error adding saved link:', err);
    res.status(500).json({ error: "Failed to add saved link" });
  }
});

// Delete a saved link
router.delete("/:id", async (req, res) => {
  try {
    const result = await SavedLink.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Saved link not found" });
    }
    res.json({ message: "Saved link deleted successfully" });
  } catch (err) {
    console.error('Error deleting saved link:', err);
    res.status(500).json({ error: "Failed to delete saved link" });
  }
});

export default router;