import express from "express";
import { SavedFolder } from "../models/SavedFolder.js";

const router = express.Router();

// Recursive function to get full folder path
async function getFolderPath(folderId) {
  const path = [];
  let currentFolder = await SavedFolder.findById(folderId);

  while (currentFolder) {
    path.unshift(currentFolder);
    if (!currentFolder.parent) break;
    currentFolder = await SavedFolder.findById(currentFolder.parent);
  }

  return path;
}

// Get folders with full hierarchy
router.get("/", async (req, res) => {
  try {
    const { parent } = req.query;
    const parentId = parent === 'null' ? null : parent;

    // If no parent specified, get root-level folders
    if (!parentId) {
      const rootFolders = await SavedFolder.find({ parent: null })
        .sort({ createdAt: -1 });
      return res.json(rootFolders);
    }

    // Find direct children of the specified parent
    const children = await SavedFolder.find({ parent: parentId })
      .sort({ createdAt: -1 });

    res.json(children);
  } catch (err) {
    console.error('Error fetching saved folders:', err);
    res.status(500).json({ error: "Failed to fetch saved folders" });
  }
});
// Get links for a folder, including nested folders
router.get("/links", async (req, res) => {
  try {
    const { parent } = req.query;
    const parentId = parent === 'null' ? null : parent;

    // If no parent specified, get root-level links
    if (!parentId) {
      const rootLinks = await SavedLink.find({ folder: null })
        .sort({ createdAt: -1 });
      return res.json(rootLinks);
    }

    // Find all descendant folders, including the parent
    const descendants = await SavedFolder.find({ 
      $or: [
        { _id: parentId },
        { $expr: { $eq: ["$parent", mongoose.Types.ObjectId(parentId)] } }
      ]
    });

    const descendantIds = descendants.map(folder => folder._id);

    // Get links in these folders
    const links = await SavedLink.find({ 
      folder: { $in: descendantIds } 
    }).sort({ createdAt: -1 });

    res.json(links);
  } catch (err) {
    console.error('Error fetching saved links:', err);
    res.status(500).json({ error: "Failed to fetch saved links" });
  }
});

// Create a new folder
router.post("/", async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const newFolder = new SavedFolder({
      name,
      parent: parent || null
    });

    const savedFolder = await newFolder.save();
    res.status(201).json(savedFolder);
  } catch (err) {
    console.error('Error creating saved folder:', err);
    res.status(500).json({ error: "Failed to create saved folder" });
  }
});

// Update a folder
router.put("/:id", async (req, res) => {
  try {
    const { name, parent } = req.body;
    const updatedFolder = await SavedFolder.findByIdAndUpdate(
      req.params.id,
      { name, parent },
      { new: true }
    );
    
    if (!updatedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    
    res.json(updatedFolder);
  } catch (err) {
    console.error('Error updating saved folder:', err);
    res.status(500).json({ error: "Failed to update saved folder" });
  }
});

// Delete a folder
router.delete("/:id", async (req, res) => {
  try {
    const result = await SavedFolder.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Folder not found" });
    }
    res.json({ message: "Folder deleted successfully" });
  } catch (err) {
    console.error('Error deleting saved folder:', err);
    res.status(500).json({ error: "Failed to delete saved folder" });
  }
});

export { router as savedFolderRouter };