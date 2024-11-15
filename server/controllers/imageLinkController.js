import ImageLink from '../models/ImageLink.js';

// Create a new image link
export const createImageLink = async (req, res) => {
  try {
    const { url, altText, tags } = req.body;
    const newImageLink = new ImageLink({ url, altText, tags });
    await newImageLink.save();
    res.status(201).json(newImageLink);
  } catch (error) {
    res.status(500).json({ message: 'Error creating image link', error });
  }
};

// Get all image links
export const getImageLinks = async (req, res) => {
  try {
    const imageLinks = await ImageLink.find();
    res.json(imageLinks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching image links', error });
  }
};

// Delete an image link
export const deleteImageLink = async (req, res) => {
  try {
    const { id } = req.params;
    await ImageLink.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image link', error });
  }
};
