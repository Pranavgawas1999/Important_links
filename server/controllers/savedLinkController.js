import SavedLink from '../models/SavedLink.js';

// Create a new saved link
export const createSavedLink = async (req, res) => {
  try {
    const { url, title, description } = req.body;
    const newSavedLink = new SavedLink({ url, title, description });
    await newSavedLink.save();
    res.status(201).json(newSavedLink);
  } catch (error) {
    res.status(500).json({ message: 'Error creating saved link', error });
  }
};

// Get all saved links
export const getSavedLinks = async (req, res) => {
  try {
    const savedLinks = await SavedLink.find();
    res.json(savedLinks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved links', error });
  }
};

// Delete a saved link
export const deleteSavedLink = async (req, res) => {
  try {
    const { id } = req.params;
    await SavedLink.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting saved link', error });
  }
};
