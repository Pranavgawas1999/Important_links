import express from "express";
import mongoose from "mongoose";
import { ImageFolder } from "../models/ImageFolder.js";
import { ImageLink } from "../models/ImageLink.js";

const router = express.Router();

// Recursive function to get full folder path
async function getFolderPath(folderId) {
  const path = [];
  let currentFolder = await ImageFolder.findById(folderId);

  while (currentFolder) {
    path.unshift(currentFolder);
    if (!currentFolder.parent) break;
    currentFolder = await ImageFolder.findById(currentFolder.parent);
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
      const rootFolders = await ImageFolder.find({ parent: null })
        .sort({ createdAt: -1 });
      return res.json(rootFolders);
    }

    // Find direct children of the specified parent
    const children = await ImageFolder.find({ parent: parentId })
      .sort({ createdAt: -1 });

    res.json(children);
  } catch (err) {
    console.error('Error fetching image folders:', err);
    res.status(500).json({ error: "Failed to fetch image folders" });
  }
});

// Get links for a folder, including nested folders
router.get("/links", async (req, res) => {
  try {
    const { parent } = req.query;
    const parentId = parent === 'null' ? null : parent;

    // If no parent specified, get root-level links
    if (!parentId) {
      const rootLinks = await ImageLink.find({ folder: null })
        .sort({ createdAt: -1 });
      return res.json(rootLinks);
    }

    // Find all descendant folders, including the parent
    const descendants = await ImageFolder.find({ 
      $or: [
        { _id: parentId },
        { $expr: { $eq: ["$parent", mongoose.Types.ObjectId(parentId)] } }
      ]
    });

    const descendantIds = descendants.map(folder => folder._id);

    // Get links in these folders
    const links = await ImageLink.find({ 
      folder: { $in: descendantIds } 
    }).sort({ createdAt: -1 });

    res.json(links);
  } catch (err) {
    console.error('Error fetching image links:', err);
    res.status(500).json({ error: "Failed to fetch image links" });
  }
});

// Get a specific folder with its contents
router.get("/:id", async (req, res) => {
  try {
    const folder = await ImageFolder.findById(req.params.id).populate("parent");
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    const subfolders = await ImageFolder.find({ parent: req.params.id });
    const images = await ImageLink.find({ folder: req.params.id });

    res.json({ folder, subfolders, images });
  } catch (err) {
    console.error("Error fetching folder details:", err);
    res.status(500).json({ error: "Failed to fetch folder details" });
  }
});

// Create a new folder
router.post("/", async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }
    if (parent && !mongoose.Types.ObjectId.isValid(parent)) {
      return res.status(400).json({ error: "Invalid parent folder ID" });
    }

    const existingFolder = await ImageFolder.findOne({ name, parent: parent || null });
    if (existingFolder) {
      return res.status(400).json({ error: "A folder with this name already exists" });
    }

    const newFolder = new ImageFolder({ name, parent: parent || null });
    const imageFolder = await newFolder.save();
    res.status(201).json(imageFolder);
  } catch (err) {
    console.error("Error creating image folder:", err);
    res.status(500).json({ error: "Failed to create image folder" });
  }
});

// Update a folder
router.put("/:id", async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (parent && req.params.id === parent) {
      return res.status(400).json({ error: "Folder cannot be its own parent" });
    }

    if (parent && !(await isValidParent(req.params.id, parent))) {
      return res.status(400).json({ error: "Circular reference detected" });
    }

    const updatedFolder = await ImageFolder.findByIdAndUpdate(
      req.params.id,
      { name, parent },
      { new: true }
    ).populate("parent");

    if (!updatedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(updatedFolder);
  } catch (err) {
    console.error("Error updating image folder:", err);
    res.status(500).json({ error: "Failed to update image folder" });
  }
});

// Delete a folder and optionally move contents
router.delete("/:id", async (req, res) => {
  try {
    const { moveContentsTo } = req.query;

    const folder = await ImageFolder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const session = await ImageFolder.startSession();
    session.startTransaction();

    try {
      if (moveContentsTo) {
        if (!mongoose.Types.ObjectId.isValid(moveContentsTo)) {
          throw new Error("Invalid destination folder ID");
        }

        await ImageFolder.updateMany({ parent: req.params.id }, { parent: moveContentsTo }).session(session);
        await ImageLink.updateMany({ folder: req.params.id }, { folder: moveContentsTo }).session(session);
      } else {
        const deleteRecursively = async (parentId) => {
          const subfolders = await ImageFolder.find({ parent: parentId });
          for (const subfolder of subfolders) {
            await deleteRecursively(subfolder._id);
            await ImageFolder.findByIdAndDelete(subfolder._id).session(session);
          }
        };
        await deleteRecursively(req.params.id);
        await ImageLink.deleteMany({ folder: req.params.id }).session(session);
      }

      await ImageFolder.findByIdAndDelete(req.params.id).session(session);

      await session.commitTransaction();
      res.json({ message: "Folder and contents deleted successfully" });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("Error deleting image folder:", err);
    res.status(500).json({ error: "Failed to delete image folder" });
  }
});

export { router as imageFolderRouter };
