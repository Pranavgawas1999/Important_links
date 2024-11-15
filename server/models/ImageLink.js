import mongoose from 'mongoose';

const imageLinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    required: false,
  },
  tags: {
    type: [String], // An array of strings for tags
    required: false,
  },
});

const ImageLink = mongoose.model('ImageLink', imageLinkSchema);

export default ImageLink;
